import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { InventoryModule } from "./inventory/inventory.module";
import { PricingModule } from './pricing/pricing.module';

@Module({
    imports: [HealthModule, AuthModule, InventoryModule, PricingModule]
})

export class ApiModule { }