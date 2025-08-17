import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceEntity } from 'src/entities/price.entity';
import { RatePlanEntity } from 'src/entities/rate-plan.entity';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RatePlanEntity, PriceEntity])
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService]
})
export class PricingModule { }
