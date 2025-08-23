import { HttpService } from "@nestjs/axios";
import { Body, Controller, Delete, Get, Headers, HttpException, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AccessGuard } from "src/api/auth/access.guard";

@Controller('inventory')
export class InventoryController {
    constructor(private readonly http: HttpService) { }

    private rethrow(e: any): never {
        const status = e?.response?.status ?? 502;
        const data = e?.response?.data ?? { message: e?.message ?? 'Upstream error' };
        throw new HttpException(data, status);
    }

    @UseGuards(AccessGuard)
    @Post()
    async createHold(@Body() dto: any, @Headers() headers: Record<string, string>) {
        try {
            const { data } = await this.http.axiosRef.post('', dto, {
                headers: {
                    'Idempotency-Key': headers['idempotency-key']
                }
            });
            return data; // { holdId, ttl }
        } catch (e) { this.rethrow(e); }
    }

    @Get('/:holdId')
    async getHold(@Param('holdId') holdId: string) {
        try {
            const { data } = await this.http.axiosRef.get(`/${holdId}`);
            return data;
        } catch (e) { this.rethrow(e); }
    }

    @UseGuards(AccessGuard)
    @Post('/:holdId/confirm')
    async confirmHold(@Param('holdId') holdId: string, @Body('userId') userId?: string) {
        try {
            const { data } = await this.http.axiosRef.post(`/${holdId}/confirm`, { userId });
            return data;
        } catch (e) { this.rethrow(e); }
    }

    @Delete('')
    async releaseHold(@Query('holdId') holdId: string) {
        try {
            const { data } = await this.http.axiosRef.delete('', { params: { holdId } });
            return data;
        } catch (e) { this.rethrow(e); }
    }
}