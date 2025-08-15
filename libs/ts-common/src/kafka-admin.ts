import { Admin, Kafka } from "kafkajs";

export async function createKafkaAdmin(brokers: string[]): Promise<Admin> {
    const kafka = new Kafka({ brokers });
    const admin = kafka.admin();
    await admin.connect();
    return admin;
}