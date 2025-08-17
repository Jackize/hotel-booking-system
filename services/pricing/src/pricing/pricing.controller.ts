import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CreatePriceDto } from 'src/dto/create-price.dto';
import { CreateRatePlanDto } from 'src/dto/create-rate-plan.dto';
import { QuoteRequestDto } from 'src/dto/quote.dto';
import { UpdatePriceDto } from 'src/dto/update-price.dto';
import { UpdateRatePlanDto } from 'src/dto/update-rate-plan.dto';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) { }

  // Rate Plan endpoints
  @Post('rate-plans')
  create(@Body() createRatePlanDto: CreateRatePlanDto) {
    return this.pricingService.createRatePlane(createRatePlanDto);
  }

  @Get('rate-plans')
  findAll() {
    return this.pricingService.findAllRatePlans();
  }

  @Get('rate-plans/:id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pricingService.findRatePlanById(id);
  }

  @Patch('rate-plans/:id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateRatePlanDto: UpdateRatePlanDto) {
    return this.pricingService.updateRatePlan(id, updateRatePlanDto);
  }

  @Delete('rate-plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pricingService.deleteRatePlan(id);
  }

  // Price endpoints
  @Post('prices')
  createPrice(@Body() createPriceDto: CreatePriceDto) {
    return this.pricingService.createPrice(createPriceDto)
  }

  @Get('prices')
  findAllPrices() {
    return this.pricingService.findAllPrices();
  }

  @Get('prices/:id')
  findPriceById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pricingService.findPriceById(id);
  }

  @Get('rate-plans/:ratePlanId/prices')
  findPricesByRatePlan(@Param('ratePlanId', new ParseUUIDPipe()) ratePlanId: string) {
    return this.pricingService.findPricesByRatePlan(ratePlanId);
  }

  @Get('room-types/:roomTypeId/prices')
  findPricesByRoomType(@Param('roomTypeId') roomTypeId: string) {
    return this.pricingService.findPricesByRoomType(roomTypeId);
  }

  @Patch('prices/:id')
  updatePrice(@Param('id', new ParseUUIDPipe()) id: string, @Body() updatePriceDto: UpdatePriceDto) {
    return this.pricingService.updatePrice(id, updatePriceDto);
  }

  @Delete('prices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePrice(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pricingService.deletePrice(id);
  }

  // Quote endpoint
  @Post('quote')
  quote(@Body() dto: QuoteRequestDto) {
    return this.pricingService.quote(dto);
  }
}
