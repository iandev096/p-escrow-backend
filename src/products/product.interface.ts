import { ProductImageType } from "./entities/product-image.entity";

export interface IProductImageGroup {
    publicId: string;
    url: string;
    type: ProductImageType
}

interface ICloudinaryCB {
    productId: string,
    userId: string,
    imageType: ProductImageType
}

export interface ICloudinaryCBRes extends ICloudinaryCB {
    bytes: string,
    created_at: string,
    etag: string,
    existing: string,
    format: string,
    height: string,
    placeholder: boolean,
    public_id: string,
    resource_type: string,
    signature: string,
    type: string,
    version: string,
    width: string
}

export interface ICloudinaryCBErr extends ICloudinaryCB {
    error: string;
}