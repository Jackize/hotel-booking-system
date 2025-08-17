import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfraModule } from './common/infra/infra.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [InfraModule, PricingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
