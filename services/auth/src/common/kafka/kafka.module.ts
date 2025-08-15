import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthEvents } from "./auth.events";
@Global()
@Module({
    providers: [
        {
            provide: AuthEvents,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const broker = configService.get<string>('KAFKA_BROKERS')?.split(',').map(s => s.trim()) || [];
                return new AuthEvents(broker);
            }
        }
    ],
    exports: [AuthEvents]
})
export class KafkaModule { }