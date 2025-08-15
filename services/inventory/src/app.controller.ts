import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { HoldsService } from './app.service';
import { CreateHoldDto } from './dto/holds.dto';

@Controller('holds')
export class HoldsController {
  constructor(private readonly svc: HoldsService) { }

  @Post()
  create(
    @Body() dto: CreateHoldDto,
    @Headers('Idempotency-Key') idemKey?: string,
  ) {
    return this.svc.createHold(dto, idemKey);
  }

  @Get(':holdId')
  get(@Param('holdId') holdId: string) {
    return this.svc.getHold(holdId);
  }

  @Delete()
  release(@Query('holdId') holdId: string) {
    return this.svc.releaseHold(holdId, 'manual');
  }

  // booking-service gọi để xác nhận hold trước khi tạo booking
  @Post(':holdId/confirm')
  confirm(@Param('holdId') holdId: string, @Body('userId') userId?: string) {
    return this.svc.confirmHold(holdId, userId);
  }
}