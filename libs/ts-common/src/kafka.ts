import { Admin, CompressionTypes, Consumer, IHeaders, Kafka, logLevel, Producer } from "kafkajs";

export type kafkaWrapperOptions = {
    clientId: string;
    brokers: string[];
    ssl?: boolean;
    sasl?: {
        mechanism: 'scram-sha-512';
        username: string;
        password: string;
    },

    // Producer
    idempotentProducer?: boolean; // default false (dev): product can be true
    acks: 0 | 1 | -1;
    compression?: 'gzip' | 'snappy' | 'lz4' | 'none'

    // consumer
    groupId?: string    // require if runConsumer
    sessionTimeoutMs?: number;  // default 30000
    heartbeatIntervalMs?: number; // default 3000
    rebalanceTimeoutMs?: number; // default 60000
    maxBytesPerPartition?: number;  // default 1MB
    maxInFlightRequests?: number;   // default 5
    autoCommit?: boolean;       // default true
    autoCommitInterval?: number;    // ms
    autoCommitThreshold?: number;   // messages

    // Logging (optional)
    logger?: (level: 'info' | 'error' | 'warn' | 'debug', msg: string, meta?: Record<string, any>) => void;
}

export type ProduceMessage = {
    key?: string;
    value: Buffer | string;
    headers?: IHeaders;
    partition?: number
}

export class KafkaWrapper {
    private kafka: Kafka;
    private producer?: Producer
    private consumer?: Consumer
    private admin?: Admin
    private readonly opts: kafkaWrapperOptions

    constructor(opts: kafkaWrapperOptions) {
        this.opts = opts

        this.kafka = new Kafka({
            clientId: opts.clientId,
            brokers: opts.brokers,
            sasl: opts.sasl ?? undefined,
            ssl: opts.ssl,
            logLevel: logLevel.NOTHING
        })

    }

    async connectProducer() {
        if (this.producer) return;

        this.producer = this.kafka.producer({
            idempotent: !!this.opts.idempotentProducer,
            allowAutoTopicCreation: false, // best practice: chủ động ensureTopic
            maxInFlightRequests: this.opts.maxInFlightRequests ?? 5,
        });

        await this.producer.connect();
        this.log('info', 'Producer connected', { clientId: this.opts.clientId, brokers: this.opts.brokers });
    }

    async connectConsumer() {
        if (!this.opts.groupId) throw new Error('groupId is required to connect consumer');
        if (this.consumer) return;

        this.consumer = this.kafka.consumer({
            groupId: this.opts.groupId,
            sessionTimeout: this.opts.sessionTimeoutMs ?? 30000,
            heartbeatInterval: this.opts.heartbeatIntervalMs ?? 3000,
            rebalanceTimeout: this.opts.rebalanceTimeoutMs ?? 60000,
            maxBytesPerPartition: this.opts.maxBytesPerPartition ?? 1 * 1024 * 1024,
            allowAutoTopicCreation: false,
        });

        await this.consumer.connect();
        this.log('info', 'Consumer connected', { clientId: this.opts.clientId, groupId: this.opts.groupId });
    }

    async connectAdmin() {
        if (this.admin) return;
        this.admin = this.kafka.admin();
        await this.admin.connect();
        this.log('info', 'Admin connected', { clientId: this.opts.clientId });
    }

    async disconnect() {
        await Promise.allSettled([
            this.consumer?.disconnect(),
            this.producer?.disconnect(),
            this.admin?.disconnect(),
        ]);
        this.log('info', 'Kafka connections closed');
    }

    /* -------------------------- Admin helpers -------------------------- */

    async ensureTopic(topic: string, partitions = 3, replicationFactor = 1) {
        await this.connectAdmin();
        const exists = (await this.admin!.listTopics()).includes(topic);
        if (exists) return false;

        await this.admin!.createTopics({
            waitForLeaders: true,
            topics: [{ topic, numPartitions: partitions, replicationFactor }],
        });

        this.log('info', 'Topic created', { topic, partitions, replicationFactor });
        return true;
    }

    async topicDescribe(topic: string) {
        await this.connectAdmin();
        const md = await this.admin!.fetchTopicMetadata({ topics: [topic] });
        return md;
    }

    /* -------------------------- Producer API -------------------------- */

    async send(topic: string, messages: ProduceMessage[]) {
        await this.connectProducer();

        const compression = this.opts.compression === 'gzip'
            ? CompressionTypes.GZIP
            : this.opts.compression === 'snappy'
                ? CompressionTypes.Snappy
                : this.opts.compression === 'lz4'
                    ? CompressionTypes.LZ4
                    : CompressionTypes.None;

        try {
            const res = await this.producer!.send({
                topic,
                acks: this.opts.acks ?? -1,
                compression,
                messages,
            });
            this.log('debug', 'Producer send ok', { topic, count: messages.length, res });
            return res;
        } catch (e: any) {
            this.log('error', 'Producer send failed', { topic, error: e?.message });
            throw e;
        }
    }

    async sendOne(topic: string, msg: ProduceMessage) {
        return this.send(topic, [msg]);
    }

    /* -------------------------- Consumer API -------------------------- */

    /**
     * Subscribe + run consumer loop.
     * @param topic Kafka topic
     * @param handler async function that processes each message
     * @param fromBeginning read from earliest
     */
    async runConsumer(
        topic: string,
        handler: (payload: {
            topic: string;
            partition: number;
            key: Buffer | null;
            value: Buffer | null;
            headers: IHeaders | undefined;
            timestamp: string;
            offset: string;
            commit: () => Promise<void>;
        }) => Promise<void>,
        fromBeginning = false,
    ) {
        await this.connectConsumer();
        await this.consumer!.subscribe({ topic, fromBeginning });

        const autoCommit = this.opts.autoCommit ?? true;
        const commitNow = async () => {
            if (!autoCommit) await this.consumer!.commitOffsets([{ topic, partition: 0, offset: (Number.NaN as any) }]); // noop placeholder
        };

        await this.consumer!.run({
            autoCommit,
            autoCommitInterval: this.opts.autoCommitInterval,
            autoCommitThreshold: this.opts.autoCommitThreshold,
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    await handler({
                        topic,
                        partition,
                        key: message.key ?? null,
                        value: message.value ?? null,
                        headers: message.headers,
                        timestamp: message.timestamp,
                        offset: message.offset,
                        commit: async () => {
                            if (!autoCommit) {
                                await this.consumer!.commitOffsets([{ topic, partition, offset: (Number(message.offset) + 1).toString() }]);
                            }
                        },
                    });
                    if (autoCommit) return;
                } catch (e: any) {
                    this.log('error', 'Consumer handler error', {
                        topic, partition, offset: message.offset, error: e?.message,
                    });
                    // Chiến lược xử lý lỗi:
                    // - Nếu muốn DLQ, publish sang topic .DLQ ở đây
                    // - Hoặc pause/resume để backoff
                    // Tạm thời: ném lỗi để kafkajs retry theo cơ chế mặc định (rebalancing sẽ rewind offset)
                    throw e;
                }
            },
        });

        this.log('info', 'Consumer is running', { topic, groupId: this.opts.groupId });
    }

    /* -------------------------- Health -------------------------- */

    async health() {
        try {
            await this.connectAdmin();
            const { brokers } = await this.admin!.describeCluster();
            return { status: 'UP', brokers };
        } catch (e: any) {
            return { status: 'DOWN', error: e?.message };
        }
    }

    /* -------------------------- Utils -------------------------- */

    private log(level: 'info' | 'error' | 'warn' | 'debug', msg: string, meta?: Record<string, any>) {
        if (this.opts.logger) return this.opts.logger(level, msg, meta);
        // fallback console
        const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
        if (level === 'error') return console.error('[kafka]', line);
        if (level === 'warn') return console.warn('[kafka]', line);
        if (level === 'debug') return console.debug('[kafka]', line);
        console.log('[kafka]', line);
    }
}