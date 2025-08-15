import Redis from "ioredis";

let redisClient: Redis | null = null;

export function createRedisClient(url?: string): Redis {
    if (redisClient) {
        return redisClient;
    }
    redisClient = new Redis(url || process.env.REDIS_URL || "redis://localhost:6379");
    redisClient.on("error", (err) => {
        console.error("Redis Client Error", err);
    });
    return redisClient;
}
