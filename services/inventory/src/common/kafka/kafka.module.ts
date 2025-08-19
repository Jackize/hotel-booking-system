import { KafkaWrapper, TOKENS } from "@hotel/ts-common";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InventoryEvents } from "./inventory.events";
@Global()
@Module({
    providers: [
        {
            provide: TOKENS.KAFKA_PRODUCER,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const brokers = configService.get<string>('KAFKA_BROKERS')?.split(',').map(s => s.trim()) || [];
                return new KafkaWrapper({
                    clientId: process.env.KAFKA_CLIENT_ID ?? 'inventory-service',
                    brokers,
                    idempotentProducer: false, // dev
                    acks: -1,
                    compression: 'gzip',
                    groupId: process.env.KAFKA_GROUP_ID ?? 'inventory-service-group',
                    logger: (lvl, msg, meta) => {
                        // nếu có pino: logger[lvl]({ kafka: meta }, msg)
                        console.log(`[kafka:${lvl}]`, msg, meta ?? {});
                    },
                });
            }
        },
        InventoryEvents
    ],
    exports: [TOKENS.KAFKA_PRODUCER, InventoryEvents]
})
export class KafkaModule { }