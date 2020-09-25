import { IsString, IsOptional, IsNumber } from "class-validator";
import { Transform } from "class-transformer";

export class CreateContactDetailDto {

    @IsString()
    country: string;

    @IsString()
    city: string;

    @IsOptional()
    @IsString()
    street: string;

    @IsOptional()
    @IsString()
    landMark: string;

    @IsOptional()
    @IsString()
    residentialAddress: string;

    @IsOptional()
    @IsNumber()
    @Transform(value => Number(value))
    lat: number;

    @IsOptional()
    @IsNumber()
    @Transform(value => Number(value))
    lng: number;
}


export class UpdateContactDetailDto {

    @IsOptional()
    @IsString()
    country: string;

    @IsOptional()
    @IsString()
    city: string;

    @IsOptional()
    @IsString()
    street: string;

    @IsOptional()
    @IsString()
    landMark: string;

    @IsOptional()
    @IsString()
    residentialAddress: string;

    @IsOptional()
    @IsNumber()
    @Transform(value => Number(value))
    lat: number;

    @IsOptional()
    @IsNumber()
    @Transform(value => Number(value))
    lng: number;
}