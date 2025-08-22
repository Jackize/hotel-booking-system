import { HttpService } from '@nestjs/axios';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { AccessGuard } from '../auth/access.guard';

@Controller('pricing')
export class PricingController {
  constructor(private readonly http: HttpService) { }

  private rethrow(e: any): never {
    const status = e?.response?.status ?? 502;
    const data = e?.response?.data ?? { message: e?.message ?? 'Upstream error' };
    throw new HttpException(data, status);
  }

  @Get('health')
  async getHealth() {
    try {
      const { data } = await this.http.axiosRef.get("health")
      return data
    } catch (e) {
      this.rethrow(e)
    }
  }

  // Rate Plan endpoints
  @UseGuards(AccessGuard)
  @Post('rate-plans')
  async create(@Body() dto: any) {
    try {
      const { data } = await this.http.axiosRef.post('rate-plans', dto);
      return data; // { holdId, ttl }
    } catch (e) { this.rethrow(e); }
  }

  @Get('rate-plans')
  async findAll() {
    try {
      const { data } = await this.http.axiosRef.get('rate-plans');
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @Get('rate-plans/:id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const { data } = await this.http.axiosRef.get(`rate-plans/${id}`);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @UseGuards(AccessGuard)
  @Patch('rate-plans/:id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateRatePlanDto: any) {
    try {
      const { data } = await this.http.axiosRef.patch(`rate-plans/${id}`, updateRatePlanDto);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @UseGuards(AccessGuard)
  @Delete('rate-plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      await this.http.axiosRef.delete(`rate-plans/${id}`);
    } catch (e) { this.rethrow(e); }
  }

  // Price endpoints
  @UseGuards(AccessGuard)
  @Post('prices')
  async createPrice(@Body() createPriceDto: any) {
    try {
      const { data } = await this.http.axiosRef.post('prices', createPriceDto);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @Get('prices')
  async findAllPrices() {
    try {
      const { data } = await this.http.axiosRef.get('prices');
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @Get('prices/:id')
  async findPriceById(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const { data } = await this.http.axiosRef.get(`prices/${id}`);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @Get('rate-plans/:ratePlanId/prices')
  async findPricesByRatePlan(@Param('ratePlanId', new ParseUUIDPipe()) ratePlanId: string) {
    try {
      const { data } = await this.http.axiosRef.get(`rate-plans/${ratePlanId}/prices`);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @Get('room-types/:roomTypeId/prices')
  async findPricesByRoomType(@Param('roomTypeId') roomTypeId: string) {
    try {
      const { data } = await this.http.axiosRef.get(`room-types/${roomTypeId}/prices`);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @UseGuards(AccessGuard)
  @Patch('prices/:id')
  async updatePrice(@Param('id', new ParseUUIDPipe()) id: string, @Body() updatePriceDto: any) {
    try {
      const { data } = await this.http.axiosRef.patch(`prices/${id}`, updatePriceDto);
      return data;
    } catch (e) { this.rethrow(e); }
  }

  @UseGuards(AccessGuard)
  @Delete('prices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePrice(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      await this.http.axiosRef.delete(`prices/${id}`);
    } catch (e) { this.rethrow(e); }
  }

  // Quote endpoint
  @UseGuards(AccessGuard)
  @Post('quote')
  async quote(@Body() dto: any) {
    try {
      const { data } = await this.http.axiosRef.post('quote', dto);
      return data;
    } catch (e) { this.rethrow(e); }
  }
}
