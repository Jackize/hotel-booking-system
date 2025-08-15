import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { KafkaModule } from 'src/common/kafka/kafka.module';
import { AppConfigModule } from '../configs/config.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [AppConfigModule, DatabaseModule, KafkaModule, RedisModule],
})
export class InfraModule {}