import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USER'),
                password: configService.get<string>('DB_PASS'),
                database: configService.get<string>('DB_NAME'),
                autoLoadEntities: true,
                migrationsTableName: `migrations`,
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                // migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
                retryAttempts: 10,
                retryDelay: 3000,
                // migrationsRun: true,
                synchronize: true,
            }),
            async dataSourceFactory(options) {
                if (!options) {
                    throw new Error('Invalid options passed');
                }

                return new DataSource(options);
            }
        })
    ]
})
export class DatabaseModule { }
