import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AccessGuard } from '../auth/access.guard';
import { PricingController } from './pricing.controller';
import { JwtService } from '../auth/jwt.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: `${process.env.PRICING_SERVICE_URL || 'http://localhost:3003'}/pricing`,
      timeout: 10000,
    }),
  ],
  controllers: [PricingController],
  providers: [AccessGuard, JwtService]
})
export class PricingModule { }
