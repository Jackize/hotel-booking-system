import { IsDateString, IsInt, IsString, IsUUID, Min } from "class-validator";

export class QuoteRequestDto {
    @IsUUID()
    ratePlanId: string;

    @IsString()
    roomTypeId: string;

    @IsDateString()
    checkIn: string;

    @IsDateString()
    checkOut: string;

    @IsInt()
    @Min(1)
    rooms: number = 1;
}

export type QuoteResponseDto = {
    ratePlanId: string;
    roomTypeId: string;
    nights: number;
    currency: string;
    rooms: number;
    breakdown: Array<{ date: string, amount: string; source: 'PRICE' | 'BASE' }>,
    subtotal: string;
    total: string
}