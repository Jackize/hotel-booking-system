import { Module } from '@nestjs/common';
import { HoldsController } from './app.controller';
import { HoldsService } from './app.service';
import { InfraModule } from './common/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [HoldsController],
  providers: [HoldsService],
})
export class AppModule { }
