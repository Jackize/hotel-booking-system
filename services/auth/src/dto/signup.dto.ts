import { IsEmail, IsString, MinLength } from 'class-validator';
export class SignupDto {
    @IsEmail() email: string;
    @IsString() fullName: string;
    @MinLength(8) password: string;
}