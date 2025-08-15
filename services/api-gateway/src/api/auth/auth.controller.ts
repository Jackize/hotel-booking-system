import { HttpService } from '@nestjs/axios';
import { Body, Controller, Headers, HttpException, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    constructor(private readonly http: HttpService) { }

    private rethrow(e: any) {
        const status = e?.response?.status ?? e?.status ?? 502;
        const data = e?.response?.data ?? { message: e?.message ?? 'Upstream error' };
        throw new HttpException(data, status);
    }

    @Post('signup')
    async signup(@Body() dto: { email: string; password: string; fullName: string }) {
        try {
            const { data } = await this.http.axiosRef.post(`/signup`, dto);
            return data;
        } catch (e) {
            this.rethrow(e);
        }
    }

    @Post('login')
    async login(@Body() dto: { email: string; password: string }) {
        try {
            const { data } = await this.http.axiosRef.post(`/login`, dto);
            return data;
        } catch (e) {
            this.rethrow(e);
        }
    }

    @Post('refresh')
    async refresh(@Body() dto: { refreshToken: string }) {
        try {
            const { data } = await this.http.axiosRef.post(`/refresh`, dto);
            return data; // { accessToken: '...' }
        } catch (e) {
            this.rethrow(e);
        }
    }

    @Post('logout')
    async logout(
        @Headers('authorization') authorization: string | undefined,
        @Body('refreshToken') refreshToken?: string,
    ) {
        try {
            const { data } = await this.http.axiosRef.post(
                `/logout`,
                { refreshToken },                          // 👈 đúng tên field
                { headers: authorization ? { Authorization: authorization } : undefined }, // 👈 forward token
            );
            return data;
        } catch (e) {
            this.rethrow(e);
        }
    }
}