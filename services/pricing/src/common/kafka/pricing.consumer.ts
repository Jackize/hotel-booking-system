import { PricingRateUpdatedSchema } from '@hotel/contracts/avro/pricing';
import { KafkaWrapper, TOKENS } from '@hotel/ts-common';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import * as avro from 'avsc';

@Injectable()
export class PricingConsumer implements OnModuleInit {
    private updatedType = avro.Type.forSchema(PricingRateUpdatedSchema as any);

    constructor(@Inject(TOKENS.KAFKA_PRODUCER) private readonly kafka: KafkaWrapper) {}

    async onModuleInit() {
        await this.kafka.runConsumer(
            'pricing.rate.updated',
            async ({ topic, partition, key, value, headers, offset, timestamp, commit }) => {
                if (!value) return;

                try {
                    const evt = this.updatedType.fromBuffer(value as Buffer);
                    console.log(`[PricingConsumer][P${partition}][${offset}] Received event:`, evt);
                    // TODO: Add actual business logic here to process the pricing update
                    await commit();
                } catch (error) {
                    console.error(`[PricingConsumer] Decode error for topic ${topic}, offset ${offset}:`, error);
                    // Depending on the error handling strategy, you might want to commit or not.
                    // For now, re-throwing to let KafkaJS handle retries/DLQ if configured.
                    throw error;
                }
            },
            true // fromBeginning
        );
        console.log('PricingConsumer started listening for pricing.rate.updated');
    }
}
