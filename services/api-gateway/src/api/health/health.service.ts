import { HttpException, Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { Admin } from "kafkajs";
import { TOKENS } from "src/common/constants/token";
import { DataSource } from 'typeorm';

type Detail = 'UP' | 'DOWN'

@Injectable()
export class HealthService {
    constructor(
        @Inject(TOKENS.DB) private readonly ds: DataSource,
        @Inject(TOKENS.REDIS) private readonly redis: Redis,
        @Inject(TOKENS.KAFKA_ADMIN) private readonly kafkaAdmin: Admin,
    ) { }

    async check() {
        const details: Record<string, Detail | { status: Detail, error?: string }> = {}
        let globalOk = true;

        // DB
        try {
            await this.ds.query('SELECT 1');
            details.database = 'UP';
        } catch (error) {
            details.database = { status: 'DOWN', error: error instanceof Error ? error.message : String(error) };
            globalOk = false
        }

        // Redis
        try {
            const pong = await this.redis.ping();
            details.redis = pong === 'PONG' ? 'UP' : { status: 'DOWN', error: `Error pinging Redis: ${pong}` };
            if (pong !== 'PONG') globalOk = false;
        } catch (error) {
            details.redis = { status: 'DOWN', error: error instanceof Error ? error.message : String(error) };
            globalOk = false;
        }

        // Kafka
        try {
            await this.kafkaAdmin.listTopics();
            details.kafka = 'UP';
        } catch (error) {
            console.log("🚀 ~ HealthService ~ check ~ error:", error)
            details.kafka = { status: 'DOWN', error: error instanceof Error ? error.message : String(error) };
            globalOk = false;
        }

        const body = {
            status: globalOk ? 'UP' : 'DOWN',
            details,
            timestamp: Date.now(),
        }

        if (!globalOk) {
            throw new HttpException(body, 503);
        }
        return body;
    }
}