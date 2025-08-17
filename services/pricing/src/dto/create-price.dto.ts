import { IsBoolean, IsDateString, IsNumber, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePriceDto {
    @IsUUID()
    ratePlanId: string;

    @IsString()
    roomTypeId: string;

    @IsNumber()
    amount: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsObject()
    conditions?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}