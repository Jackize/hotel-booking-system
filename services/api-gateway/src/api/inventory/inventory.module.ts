import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AccessGuard } from 'src/api/auth/access.guard';
import { JwtService } from 'src/api/auth/jwt.service';
import { InventoryController } from './inventory.controller';

@Module({
    imports: [
        HttpModule.register({
            baseURL: `${process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002'}/holds`,
            timeout: 10000,
        }),
    ],
    controllers: [InventoryController],
    providers: [AccessGuard, JwtService]
})
export class InventoryModule { }