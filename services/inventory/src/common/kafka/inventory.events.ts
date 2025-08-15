import { InventoryHoldCreatedSchema, InventoryHoldReleasedSchema } from '@hotel/contracts/avro/inventory';
import * as avro from 'avsc';
import KafkaWrapper from 'ts-common/dist/kafka';
export class InventoryEvents {
    private kafka: KafkaWrapper;
    constructor(brokers: string[]) {
        this.kafka = new KafkaWrapper(brokers);
    }

    private createdType = avro.Type.forSchema(InventoryHoldCreatedSchema);
    private releasedType = avro.Type.forSchema(InventoryHoldReleasedSchema);


    async connect() { await this.kafka.connect(); }
    async disconnect() { await this.kafka.disconnect(); }
    async onModuleInit() { await this.kafka.connect(); }
    async onModuleDestroy() { await this.kafka.disconnect(); }

    async publishHoldCreated(evt: {
        holdId: string; hotelId: string; userId: string;
        items: { roomId: string; checkIn: string; checkOut: string }[];
        ttl: number; timestamp: number;
    }) {
        const value = this.createdType.toBuffer(evt);
        await this.kafka.sendMessage('inventory.hold.created', [
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
        await this.kafka.sendMessage('inventory.hold.released', [
            { key: evt.holdId, value }
        ]);
    }
}