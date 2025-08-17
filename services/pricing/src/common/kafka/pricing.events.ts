import { PricingRateUpdatedSchema } from '@hotel/contracts/avro/pricing';
import { KafkaWrapper, TOKENS } from '@hotel/ts-common';
import { Inject } from '@nestjs/common';
import * as avro from 'avsc';
import { randomUUID } from 'crypto';


export class PricingEvents {

    constructor(@Inject(TOKENS.KAFKA_PRODUCER) private readonly kafka: KafkaWrapper) {
    }

    async onModuleInit() {
        await this.kafka.connectProducer();
        await this.kafka.ensureTopic('pricing.rate.updated', 3, 1)
    }
    async onModuleDestroy() { await this.kafka.disconnect(); }

    private updatedType = avro.Type.forSchema(PricingRateUpdatedSchema)

    async publishRateUpdated(payload: {
        ratePlanId: string;
        roomTypeId: string;
        date: string;
        amount: string;
        currency: string;
        operation: 'CREATE' | 'UPDATE' | 'UPSERT';
        previousAmount?: string | null
    }) {
        const evt = {
            eventId: randomUUID(),
            ...payload,
            previousAmount: payload.previousAmount ?? null,
            timestamp: Date.now()
        }

        const value = this.updatedType.toBuffer(evt)
        await this.kafka.send("pricing.rate.updated", [
            { key: `${payload.ratePlanId}:${payload.roomTypeId}:${payload.date}`, value }
        ])
        return evt
    }
}