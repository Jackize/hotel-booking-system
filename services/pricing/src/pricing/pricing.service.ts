import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { PricingEvents } from 'src/common/kafka/pricing.events';
import { CreatePriceDto } from 'src/dto/create-price.dto';
import { CreateRatePlanDto } from 'src/dto/create-rate-plan.dto';
import { QuoteRequestDto, QuoteResponseDto } from 'src/dto/quote.dto';
import { UpdatePriceDto } from 'src/dto/update-price.dto';
import { PriceEntity } from 'src/entities/price.entity';
import { RatePlanEntity } from 'src/entities/rate-plan.entity';
import { Repository } from 'typeorm';
import { UpdateRatePlanDto } from './../dto/update-rate-plan.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(RatePlanEntity)
    private ratePlanRepository: Repository<RatePlanEntity>,
    @InjectRepository(PriceEntity)
    private priceRepository: Repository<PriceEntity>,
    private readonly events: PricingEvents
  ) { }

  async createRatePlane(createRatePlanDto: CreateRatePlanDto): Promise<RatePlanEntity> {
    if (!createRatePlanDto.hotelId || !createRatePlanDto.code || !createRatePlanDto.name) {
      throw new BadRequestException('hotelId, code, name are require')
    }
    const existed = await this.ratePlanRepository.findOne({ where: { hotelId: createRatePlanDto.hotelId, code: createRatePlanDto.code } });
    if (existed) throw new BadRequestException(`Rate plan with hotelId=${createRatePlanDto.hotelId} & code=${createRatePlanDto.code} already exists`);

    const ratePlan = this.ratePlanRepository.create(createRatePlanDto)
    return await this.ratePlanRepository.save(ratePlan)
  }

  // Rate Plan methods
  async findAllRatePlans(): Promise<RatePlanEntity[]> {
    return await this.ratePlanRepository.find({
      where: { isActive: true },
      relations: ['prices']
    })
  }

  async findRatePlanById(id: string): Promise<RatePlanEntity> {
    const ratePlan = await this.ratePlanRepository.findOne({
      where: { id, isActive: true },
      relations: ['prices']
    })
    if (!ratePlan) {
      throw new NotFoundException(`Rate plan with Id not exist`)
    }
    return ratePlan
  }

  async updateRatePlan(id: string, updateRatePlanDto: UpdateRatePlanDto): Promise<RatePlanEntity> {
    const ratePlan = await this.findRatePlanById(id)
    Object.assign(ratePlan, updateRatePlanDto)
    return await this.ratePlanRepository.save(ratePlan)
  }

  async deleteRatePlan(id: string): Promise<void> {
    const ratePlan = await this.findRatePlanById(id)
    ratePlan.isActive = false;
    await this.ratePlanRepository.save(ratePlan)
  }

  // Price methods
  async createPrice(createPriceDto: CreatePriceDto): Promise<PriceEntity> {
    // Validate ratePlanId exist
    const rp = await this.ratePlanRepository.findOne({
      where: { id: createPriceDto.ratePlanId, isActive: true }
    })
    if (!rp) throw new NotFoundException(`Rate Plan ${createPriceDto.ratePlanId} not found`)

    const price = this.priceRepository.create(createPriceDto)
    const saved = await this.priceRepository.save(price)

    await this.events.publishRateUpdated({
      ratePlanId: rp.id,
      roomTypeId: createPriceDto.roomTypeId,
      date: dayjs(saved.date).format('YYYY-MM-DD'),
      amount: Number(saved.amount).toFixed(2),
      currency: saved.currency ?? rp.currency,
      operation: 'CREATE',
      previousAmount: null
    })
    return saved
  }

  async findAllPrices(): Promise<PriceEntity[]> {
    return await this.priceRepository.find({
      where: { isActive: true },
      relations: ['ratePlan'],
    });
  }

  async findPriceById(id: string): Promise<PriceEntity> {
    const price = await this.priceRepository.findOne({
      where: { id, isActive: true },
      relations: ['ratePlan'],
    })

    if (!price) throw new NotFoundException(`Price with ID ${id} not exist`)
    return price
  }

  async findPricesByRatePlan(ratePlanId: string): Promise<PriceEntity[]> {
    return await this.priceRepository.find({
      where: { ratePlanId, isActive: true },
      relations: ['ratePlan']
    })
  }

  async findPricesByRoomType(roomTypeId: string): Promise<PriceEntity[]> {
    return await this.priceRepository.find({
      where: { roomTypeId, isActive: true },
      relations: ['ratePlan'],
    });
  }

  async updatePrice(id: string, updatePriceDto: UpdatePriceDto): Promise<PriceEntity> {
    const price = await this.findPriceById(id)
    const prevAmount = price.amount
    Object.assign(price, updatePriceDto)
    const saved = await this.priceRepository.save(price)

    await this.events.publishRateUpdated({
      ratePlanId: saved.ratePlanId,
      roomTypeId: saved.roomTypeId,
      date: dayjs(saved.date).format('YYYY-MM-DD'),
      amount: Number(saved.amount).toFixed(2),
      currency: saved.currency,
      operation: 'UPDATE',
      previousAmount: Number(prevAmount).toFixed(2)
    })

    return saved
  }

  async deletePrice(id: string): Promise<void> {
    const price = await this.findPriceById(id)
    price.isActive = false
    await this.priceRepository.save(price)
  }

  // Quotes methods
  async quote(quoteDto: QuoteRequestDto): Promise<QuoteResponseDto> {
    const rp = await this.ratePlanRepository.findOne({
      where: { id: quoteDto.ratePlanId, isActive: true }
    })
    if (!rp) throw new NotFoundException(`Rate plan ${quoteDto.ratePlanId} not found`)

    const inDate = dayjs(quoteDto.checkIn).startOf('day')
    const outDate = dayjs(quoteDto.checkOut).startOf('day')
    if (!inDate.isValid() || !outDate.isValid() || !outDate.isAfter(inDate)) {
      throw new BadRequestException('Invalid date range')
    }

    const nights: string[] = []
    for (let d = inDate; d.isBefore(outDate); d = d.add(1, 'day')) {
      nights.push(d.format('YYYY-MM-DD'))
    }

    // Load all price rows for this range
    const rows = await this.priceRepository
      .createQueryBuilder('p')
      .where('p.ratePlanId = :ratePlanId', { ratePlanId: quoteDto.ratePlanId })
      .andWhere('p.roomTypeId = :roomTypeId', { roomTypeId: quoteDto.roomTypeId })
      .andWhere('p.isActive = TRUE')
      .andWhere('p.date >= :start AND p.date < :end', { start: inDate.format('YYYY-MM-DD'), end: outDate.format('YYYY-MM-DD') })
      .orderBy('p.date', 'ASC')
      .getMany()

    // Build map date -> price row
    const byDate = new Map<string, (typeof rows)[number]>()
    for (const r of rows) {
      const key = dayjs(r.date).format('YYYY-MM-DD')
      byDate.set(key, r)
    }

    const currency = rp.currency
    const breakdown: { date: string; amount: string; source: 'PRICE' | 'BASE' }[] = []

    for (const date of nights) {
      const row = byDate.get(date)
      if (row) {
        breakdown.push({
          date,
          amount: Number(row.amount).toFixed(2),
          source: 'PRICE'
        })
      } else {
        // fallback base price
        breakdown.push({
          date,
          amount: Number(rp.basePrice ?? 0).toFixed(2),
          source: 'BASE'
        })
      }
    }

    // Calculate sum price
    const subTotalCents = breakdown.reduce((sum, b) => sum + Math.round(Number(b.amount) * 100), 0)
    const rooms = quoteDto.rooms ?? 1;
    const totalCents = subTotalCents * rooms
    const toMoney = (cents: number) => (cents / 100).toFixed(2);

    return {
      ratePlanId: rp.id,
      roomTypeId: quoteDto.roomTypeId,
      nights: nights.length,
      currency,
      rooms,
      breakdown,
      subtotal: toMoney(subTotalCents),
      total: toMoney(totalCents)
    }
  }
}
