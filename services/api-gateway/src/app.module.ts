import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './common/infra/infra.module';

@Module({
  imports: [InfraModule, ApiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
