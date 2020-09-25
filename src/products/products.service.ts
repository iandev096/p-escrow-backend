import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductRepository } from './products.repository';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, GetProductFilterDto, ProductQueryDto } from './dto/product.dto';
import { ProductCategory } from './product.enum';
import { IProductImageGroup, ICloudinaryCBErr, ICloudinaryCBRes } from './product.interface';
import { Cloudinary, CLOUDINARY } from '../cloudinary/cloudinary.provider';

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(ProductRepository)
        private productRepository: ProductRepository,
        @Inject(CLOUDINARY)
        private cloudinary: Cloudinary
    ) { }

    createProduct(createProductDto: CreateProductDto, userId: string): Promise<Product> {
        return this.productRepository.createProduct(createProductDto, userId);
    }

    getProducts(
        getProductFilterDto: GetProductFilterDto
    ): Promise<Product[]> {
        return this.productRepository.getProducts(getProductFilterDto);
    }

    getProductById(productId: string): Promise<Product> {
        return this.productRepository.getProductById(productId)
    }

    getProductsCount() {
        return this.productRepository.getProductsCount();
    }

    updateProduct(updateProductDto: UpdateProductDto, productId: string, userId: string) {
        return this.productRepository.updateProduct(updateProductDto, productId, userId);
    }

    removeProducts(productIds: string[], userId: string) {
        return this.productRepository.removeProducts(productIds, userId);
    }

    getLIkedProducts(userId: string) {
        return this.productRepository.getLikedProducts(userId);
    }
    
    likeProducts(productIds: string[], userId: string) {
        return this.productRepository.likeProducts(productIds, userId)
    }

    unlikeProducts(productId: string, userId: string) {
        return this.productRepository.unlikeProduct(productId, userId);
    }

    getFeaturedProduct(productQueryDto: ProductQueryDto) {
        return this.productRepository.getFeaturedProducts(productQueryDto);
    }

    addProductsToFeatured(productIds: string[], userId: string) {
        return this.productRepository.addProductsToFeatured(productIds, userId);
    }

    removeProductsFromFeatured(productIds: string[], userId: string) {
        return this.productRepository.removeProductsFromFeatured(productIds, userId)
    }

    addProductCategories(productId: string, categories: ProductCategory[], userId: string) {
        return this.productRepository.addProductCategories(productId, categories, userId);
    }

    removeProductCategory(productId: string, category: ProductCategory, userId: string) {
        return this.productRepository.removeProductCategory(productId, category, userId);
    }

    addProductImages(productId: string, productImagesGroup: IProductImageGroup[], userId: string) {
        return this.productRepository.addProductImages(productId, productImagesGroup, userId);
    }

    getCartWithProducts(userId: string) {
        return this.productRepository.getCartWithProducts(userId);
    }

    addProductToCart(productId: string, userId: string) {
        return this.productRepository.addProductToCart(productId, userId);
    }

    removeProductsFromCart(productIds: string[], userId: string) {
        return this.productRepository.removeProductsFromCart(productIds, userId)
    }

    removeProductImage(productId: string, imageId: string, userId: string) {
        return this.productRepository.removeProductImage(productId, imageId, userId);
    }

    async handleCloudinaryCallback(q: ICloudinaryCBErr & ICloudinaryCBRes) {
        if (q.error) {
            throw new InternalServerErrorException(q.error);
        } else {
            try {
                const res = await this.cloudinary.v2.api.resource(q.public_id, {
                    resource_type: 'image',
                });
                console.log(res)
                const product = this.addProductImages(
                    q.productId,
                    [{ url: res['secure_url'], type: q.imageType, publicId: res['public_id'] }],
                    q.userId
                );

                return product;
            } catch (err) {
                console.log(err);
                throw new InternalServerErrorException(err);
            }
        }
    }

    async removeImageFromCloudinary(publicId: string) {
        try {
            const res = await this.cloudinary.v2.api.delete_resources([publicId]);
            return res;
        } catch (err) {
            throw new InternalServerErrorException('Could not delete image from cloudinary');
        }
    }
}
