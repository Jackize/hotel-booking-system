import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { InventoryModule } from "./inventory/inventory.module";

@Module({
    imports: [HealthModule, AuthModule, InventoryModule]
})

export class ApiModule { }