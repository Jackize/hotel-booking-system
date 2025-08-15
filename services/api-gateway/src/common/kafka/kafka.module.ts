import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createKafkaAdmin } from "ts-common/dist/kafka-admin";
import { TOKENS } from "../constants/token";
@Global()
@Module({
    providers: [
        {
            provide: TOKENS.KAFKA_ADMIN,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                console.log("🚀 ~ KafkaModule ~ configService.get<string>('KAFKA_BROKERS'):", configService.get<string>('KAFKA_BROKERS'))
                const broker = configService.get<string>('KAFKA_BROKERS')?.split(',').map(s => s.trim()) || [];
                console.log("🚀 ~ KafkaModule ~ broker:", broker)
                return createKafkaAdmin(broker);
            }
        },
    ],
    exports: [TOKENS.KAFKA_ADMIN]
})
export class KafkaModule { }