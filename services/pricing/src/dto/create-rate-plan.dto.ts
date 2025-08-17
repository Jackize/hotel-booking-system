import { IsDate, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class CreateRatePlanDto {

    @IsString()
    hotelId: string;

    @IsString()
    code: string;

    @IsString()
    name: string;

    @IsNumber()
    basePrice: number;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsObject()
    rules?: Record<string, any>;

    @IsOptional()
    @IsDate()
    validFrom?: Date;

    @IsOptional()
    @IsDate()
    validTo?: Date;
}