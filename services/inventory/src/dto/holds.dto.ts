import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsString, ValidateNested } from 'class-validator';

export class HoldItemDto {
    @IsString() roomId: string;
    @IsDateString() checkIn: string;   // ISO date
    @IsDateString() checkOut: string;  // exclusive
}

export class CreateHoldDto {
    @IsString() hotelId: string;
    @IsString() userId: string;
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HoldItemDto)
    items: HoldItemDto[]; // nhiều phòng
}

export type HoldResponse = { holdId: string; ttl: number };
