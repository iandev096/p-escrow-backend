import { IsString, IsNumber, IsOptional, IsIn, IsArray, IsInt } from "class-validator";
import { Transform } from 'class-transformer';
import { ProductStatus, ProductCategory } from "../product.enum";
import { enumToArray } from "../../shared/utilities/util";
import {IProductImageGroup} from '../product.interface';

export class CreateProductDto {
    @IsString()
    fullName: string;

    @IsString()
    displayName: string;

    @IsString()
    description: string;

    @IsNumber()
    @Transform(price => Number(price))
    price: number;

    @IsNumber()
    @IsOptional()
    @Transform(price => Number(price))
    priceDiscount: number;

    @IsString()
    currency: string;

    @IsString()
    location: string;

    @IsNumber()
    @IsOptional()
    @Transform(lat => Number(lat))
    lat: number;
    
    @IsNumber()
    @IsOptional()
    @Transform(lng => Number(lng))
    lng: number;

    @IsIn(enumToArray(ProductStatus))
    status: ProductStatus;
}

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    fullName: string;

    @IsString()
    @IsOptional()
    displayName: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @IsOptional()
    @Transform(price => Number(price))
    price: number;
    
    @IsNumber()
    @IsOptional()
    @Transform(price => Number(price))
    priceDiscount: number;

    @IsString()
    @IsOptional()
    currency: string;

    @IsString()
    @IsOptional()
    location: string;

    @IsNumber()
    @IsOptional()
    @Transform(lat => Number(lat))
    lat: number;
    
    @IsNumber()
    @IsOptional()
    @Transform(lng => Number(lng))
    lng: number;

    @IsIn(enumToArray(ProductStatus))
    @IsOptional()
    status: ProductStatus;
}

export class ProductQueryDto {
    @IsInt()
    @IsOptional()
    @Transform(value => Math.abs(parseInt(value)))
    take: number;

    @IsInt()
    @IsOptional()
    @Transform(value => Math.abs(parseInt(value)))
    skip: number;
}

export class GetProductFilterDto extends ProductQueryDto {
    @IsString()
    @IsOptional()
    search: string;

    @IsNumber()
    @IsOptional()
    @Transform(price => Number(price))
    priceLt: number;

    @IsNumber()
    @IsOptional()
    @Transform(price => Number(price))
    priceGt: number;

    @IsString()
    @IsOptional()
    location: string;

    @IsIn(enumToArray(ProductStatus))
    @IsOptional()
    status: ProductStatus;

    @IsOptional()
    @Transform((values: string) => values.split(','))
    categories: ProductCategory[]
    
    @IsString()
    @IsOptional()
    userId: string;
}

export class AddProductImagesDto {
    @IsArray({
        each: true
    })
    images: IProductImageGroup[]
}