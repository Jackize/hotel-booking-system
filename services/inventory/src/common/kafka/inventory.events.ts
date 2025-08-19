import { InventoryHoldCreatedSchema, InventoryHoldReleasedSchema } from '@hotel/contracts/avro/inventory';
import { KafkaWrapper, TOKENS } from '@hotel/ts-common';
import { Inject } from '@nestjs/common';
import * as avro from 'avsc';

export class InventoryEvents {
    constructor(@Inject(TOKENS.KAFKA_PRODUCER) private readonly kafka: KafkaWrapper) {
    }

    private createdType = avro.Type.forSchema(InventoryHoldCreatedSchema);
    private releasedType = avro.Type.forSchema(InventoryHoldReleasedSchema);

    async onModuleInit() {
        await this.kafka.connectProducer();
        await this.kafka.ensureTopic('inventory.hold.created', 3, 1)
        await this.kafka.ensureTopic('inventory.hold.released', 3, 1)
    }
    async onModuleDestroy() { await this.kafka.disconnect(); }

    async publishHoldCreated(evt: {
        holdId: string; hotelId: string; userId: string;
        items: { roomId: string; checkIn: string; checkOut: string }[];
        ttl: number; timestamp: number;
    }) {
        const value = this.createdType.toBuffer(evt);
        await this.kafka.send('inventory.hold.created', [
            { key: evt.holdId, value }
        ]);
    }

    async publishHoldReleased(evt: {
        holdId: string; hotelId: string; userId: string;
        items: { roomId: string; checkIn: string; checkOut: string }[];
        reason: 'manual' | 'confirmed' | 'expired';
        timestamp: number;
    }) {
        const value = this.releasedType.toBuffer(evt);
        await this.kafka.send('inventory.hold.released', [
            { key: evt.holdId, value }
        ]);
    }
}