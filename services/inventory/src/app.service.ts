import { TOKENS } from '@hotel/ts-common';
import { BadRequestException, ConflictException, ForbiddenException, GoneException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as dayjs from 'dayjs';
import { Redis } from 'ioredis';
import { InventoryEvents } from './common/kafka/inventory.events';
import { CreateHoldDto, HoldItemDto, HoldResponse } from './dto/holds.dto';
import { LUA_TRY_HOLD } from './lua/redis.script';

function nightlyKeysFor(roomId: string, checkInISO: string, checkOutISO: string): string[] {
  const inDate = dayjs(checkInISO).startOf('day');
  const outDate = dayjs(checkOutISO).startOf('day');
  const keys: string[] = [];
  for (let d = inDate; d.isBefore(outDate); d = d.add(1, 'day')) {
    keys.push(`hold:${roomId}:${d.format('YYYY-MM-DD')}`);
  }
  return keys;
}

@Injectable()
export class HoldsService {
  private ttl = Number(process.env.HOLD_TTL_SECONDS ?? 300); // 5 minutes
  constructor(
    private readonly events: InventoryEvents,
    @Inject(TOKENS.REDIS) private readonly redis: Redis
  ) { }

  async onModuleInit() { await this.events.onModuleInit?.(); }
  async onModuleDestroy() { await this.events.onModuleDestroy?.(); }

  private validateItems(items: HoldItemDto[]) {
    if (!items?.length) throw new BadRequestException('items required');
    for (const it of items) {
      const inDate = dayjs(it.checkIn).startOf('day');
      const outDate = dayjs(it.checkOut).startOf('day');
      if (!inDate.isValid() || !outDate.isValid() || !outDate.isAfter(inDate)) {
        throw new BadRequestException(`Invalid date range for room ${it.roomId}`);
      }
    }
  }

  /**
   * Idempotent create: nếu có Idempotency-Key, trả lại hold cũ nếu còn hiệu lực.
   */
  async createHold(dto: CreateHoldDto, idempotencyKey?: string): Promise<HoldResponse> {
    const { hotelId, userId, items } = dto;
    this.validateItems(items);

    // Idempotency
    if (idempotencyKey) {
      const prevHoldId = await this.redis.get(`idemp:${idempotencyKey}`);
      if (prevHoldId) {
        const ttl = await this.redis.ttl(`hold:${prevHoldId}`);
        if (ttl > 0) return { holdId: prevHoldId, ttl };
        throw new ConflictException('Previous idempotency key expired; use a new Idempotency-Key');
      }
    }

    // Build all nightly keys across all rooms
    const allKeys: string[] = [];
    for (const it of items) {
      allKeys.push(...nightlyKeysFor(it.roomId, it.checkIn, it.checkOut));
    }

    // Uniquify (phòng có thể trùng khoảng? merge keys)
    const keys = Array.from(new Set(allKeys));

    const holdId = randomUUID();
    const metadata = JSON.stringify({
      holdId, hotelId, userId,
      items, // lưu nguyên danh sách phòng + khoảng ngày
      createdAt: Date.now()
    });

    // @ts-ignore
    const res = await this.redis
      .eval(LUA_TRY_HOLD, keys.length, ...keys, String(this.ttl), holdId, metadata)
      .catch((e) => (String(e?.message || e) === 'CONFLICT' ? 'CONFLICT' : Promise.reject(e)));

    if (res === 'CONFLICT') {
      throw new ConflictException('Some room nights are currently held by another user');
    }

    if (idempotencyKey) {
      await this.redis.setex(`idemp:${idempotencyKey}`, this.ttl + 60, holdId);
    }

    // Event
    await this.events.publishHoldCreated({
      holdId, hotelId, userId, ttl: this.ttl, timestamp: Date.now(),
      items: items.map(it => ({
        roomId: it.roomId,
        checkIn: dayjs(it.checkIn).format('YYYY-MM-DD'),
        checkOut: dayjs(it.checkOut).format('YYYY-MM-DD'),
      })),
    });

    return { holdId, ttl: this.ttl };
  }

  async releaseHold(holdId: string, reason: 'manual' | 'confirmed' = 'manual') {
    const raw = await this.redis.get(`hold:${holdId}`);
    if (!raw) return { ok: true };
    const meta = JSON.parse(raw) as { hotelId: string; userId: string; items: HoldItemDto[] };

    // Aggregate all keys to delete
    const keysToDel: string[] = [];
    for (const it of meta.items) {
      keysToDel.push(...nightlyKeysFor(it.roomId, it.checkIn, it.checkOut));
    }
    if (keysToDel.length) await this.redis.del(...Array.from(new Set(keysToDel)));
    await this.redis.del(`hold:${holdId}`);

    await this.events.publishHoldReleased({
      holdId,
      hotelId: meta.hotelId,
      userId: meta.userId,
      reason,
      timestamp: Date.now(),
      items: meta.items.map(it => ({
        roomId: it.roomId,
        checkIn: dayjs(it.checkIn).format('YYYY-MM-DD'),
        checkOut: dayjs(it.checkOut).format('YYYY-MM-DD'),
      })),
    });

    return { ok: true };
  }

  async getHold(holdId: string) {
    const ttl = await this.redis.ttl(`hold:${holdId}`);
    if (ttl < 0) return { exists: false };
    const raw = await this.redis.get(`hold:${holdId}`);
    return { exists: true, ttl, metadata: raw ? JSON.parse(raw) : null };
  }

  /**
   * Confirm booking: booking-service gọi endpoint này trước khi tạo booking.
   * Validate: hold tồn tại, TTL > 0, userId khớp (nếu gửi), sau đó release ngay (reason=confirmed).
   */
  async confirmHold(holdId: string, userId?: string) {
    const raw = await this.redis.get(`hold:${holdId}`);
    if (!raw) throw new GoneException('Hold not found');
    const meta = JSON.parse(raw) as { userId: string };

    const ttl = await this.redis.ttl(`hold:${holdId}`);
    if (ttl <= 0) throw new GoneException('Hold expired');

    if (userId && meta.userId && meta.userId !== userId) {
      throw new ForbiddenException('Hold does not belong to this user');
    }

    // release (sets events reason=confirmed)
    await this.releaseHold(holdId, 'confirmed');
    return { ok: true };
  }
}
