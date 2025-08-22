import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
			validationSchema: Joi.object({
				NODE_ENV: Joi.string(),
				PORT: Joi.number(),

				JWT_ACCESS_SECRET: Joi.string().required(),
				ACCESS_EXPIRE: Joi.number().required(),
				JWT_REFRESH_SECRET: Joi.string().required(),
				REFRESH_EXPIRE: Joi.number().required(),

				DB_HOST: Joi.string(),
				DB_PORT: Joi.number(),
				DB_USER: Joi.string().required(),
				DB_PASS: Joi.string().required().allow(''),
				DB_NAME: Joi.string().required(),

				REDIS_URL: Joi.string().required().default('redis://localhost:6379'),
				
				KAFKA_BROKERS: Joi.string().required(),
			})
		})
	]
})
export class AppConfigModule {}
