import { Kafka, Producer } from 'kafkajs';


class KafkaWrapper {
    private kafka: Kafka;
    private producer: Producer;

    constructor(brokers: string[]) {
        this.kafka = new Kafka({ brokers });
        this.producer = this.kafka.producer();
    }

    async connect() {
        try {
            await this.producer.connect();
        } catch (error) {
            console.error('Error connecting to Kafka:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.producer.disconnect();
        } catch (error) {
            console.error('Error disconnecting from Kafka:', error);
            throw error;
        }
    }

    async sendMessage(topic: string, message: { key?: string, value: any }[]) {
        try {
            await this.producer.send({
                topic,
                messages: message.map(msg => ({
                    key: msg.key,
                    value: msg.value
                }))
            });
        } catch (error) {
            console.error('Error sending message to Kafka:', error);
            throw error;
        }
    }
}

export default KafkaWrapper;