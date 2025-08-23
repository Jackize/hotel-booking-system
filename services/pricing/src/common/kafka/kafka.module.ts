import { KafkaWrapper, TOKENS } from "@hotel/ts-common";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfigModule } from "../configs/config.module";
import { PricingConsumer } from "./pricing.consumer";
import { PricingEvents } from "./pricing.events";
@Global()
@Module({
    imports: [AppConfigModule],
    providers: [
        {
            provide: TOKENS.KAFKA_PRODUCER,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const brokers = configService.get<string>('KAFKA_BROKERS')?.split(',').map(s => s.trim()) || [];
                return new KafkaWrapper({
                    clientId: process.env.KAFKA_CLIENT_ID ?? 'pricing-service',
                    brokers,
                    idempotentProducer: false, // dev
                    acks: -1,
                    compression: 'gzip',
                    groupId: process.env.KAFKA_GROUP_ID ?? 'pricing-service-group',
                    logger: (lvl, msg, meta) => {
                        // nếu có pino: logger[lvl]({ kafka: meta }, msg)
                        console.log(`[kafka:${lvl}]`, msg, meta ?? {});
                    },
                });
            }
        },
        PricingEvents,
        PricingConsumer
    ],
    exports: [TOKENS.KAFKA_PRODUCER, PricingEvents]
})
export class KafkaModule { }