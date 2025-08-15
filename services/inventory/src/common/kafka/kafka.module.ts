import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InventoryEvents } from "./inventory.events";
@Global()
@Module({
    providers: [
        {
            provide: InventoryEvents,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const broker = configService.get<string>('KAFKA_BROKERS')?.split(',').map(s => s.trim()) || [];
                return new InventoryEvents(broker);
            }
        }
    ],
    exports: [InventoryEvents]
})
export class KafkaModule { }