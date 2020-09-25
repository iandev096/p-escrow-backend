import { Controller, Get, Post, Param, Body, UsePipes, ValidationPipe, Patch, Query, Delete, ParseArrayPipe, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from '../products.service';
import { CreateProductDto, UpdateProductDto, GetProductFilterDto, ProductQueryDto } from '../dto/product.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { ProductCategory } from '../product.enum';
import { ICloudinaryCBRes, ICloudinaryCBErr } from '../product.interface';

@Controller('products')
export class ProductsController {
    constructor(
        private productsService: ProductsService
    ) { }

    @Post('/')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'))
    createProduct(
        @GetUser() user: any,
        @Body() createProductDto: CreateProductDto
    ) {
        return this.productsService.createProduct(createProductDto, user.userId);
    }

    @Get('/')
    @UsePipes(new ValidationPipe({ transform: true }))
    getProducts(
        @Query() getProductFilterDto: GetProductFilterDto
    ) {
        return this.productsService.getProducts(getProductFilterDto);
    }

    @Get('/count')
    getProductsCount() {
        return this.productsService.getProductsCount();
    }

    @Get('/like')
    @UseGuards(AuthGuard('jwt'))
    getLikeProducts(
        @GetUser() user: any
    ) {
        return this.productsService.getLIkedProducts(user.userId);
    }

    
    @Post('/like')
    @UseGuards(AuthGuard('jwt'))
    likeProducts(
        @Query('id', new ParseArrayPipe({ items: String, separator: ',' }))
        productIds: string[],
        @GetUser() user: any
    ) {
        return this.productsService.likeProducts(productIds, user.userId);
    }

    @Delete('/unlike')
    @UseGuards(AuthGuard('jwt'))
    unlikeProduct(
        @Query('id', ParseUUIDPipe)
        productId: string,
        @GetUser() user: any
    ) {
        return this.productsService.unlikeProducts(productId, user.userId);
    }

    @Get('/featured')
    @UsePipes(new ValidationPipe({ transform: true }))
    getFeaturedProducts(
        @Query() productQueryDto: ProductQueryDto,
    ) {
        return this.productsService.getFeaturedProduct(productQueryDto);
    }

    @Post('/featured')
    @UseGuards(AuthGuard('jwt'))
    addProductToFeatured(
        @Query('id', new ParseArrayPipe({ items: String, separator: ',' }))
        productIds: string[],
        @GetUser() user: any,
    ) {
        return this.productsService.addProductsToFeatured(productIds, user.userId);
    }

    @Delete('/featured')
    @UseGuards(AuthGuard('jwt'))
    removeFeaturedProducts (
        @Query('id', new ParseArrayPipe({ items: String, separator: ',' }))
        productIds: string[],
        @GetUser() user: any,
    ) {
        return this.productsService.removeProductsFromFeatured(productIds, user.userId);
    }

    @Post('/add-category/:productId')
    @UseGuards(AuthGuard('jwt'))
    addProductCategory(
        @Query('category', new ParseArrayPipe({ items: String, separator: ',' }))
        categories: ProductCategory[],
        @GetUser() user: any,
        @Param('productId') productId: string
    ) {
        return this.productsService.addProductCategories(productId, categories, user.userId);
    }

    @Delete('/remove-category/:productId')
    @UseGuards(AuthGuard('jwt'))
    removeProductCategory(
        @Query('category') category: ProductCategory,
        @GetUser() user: any,
        @Param('productId') productId: string
    ) {
        return this.productsService.removeProductCategory(productId, category, user.userId);
    }

    @Delete('/remove-product-image/:productId')
    @UseGuards(AuthGuard('jwt'))
    removeProductImage(
        @Param('productId') productId: string,
        @Query('imageId') imageId: string,
        @GetUser() user: any,
    ) {
        return this.productsService.removeProductImage(productId, imageId, user.userId);
    }

    @UsePipes(new ValidationPipe({ transform: true }))
    @Get('/cloudinary-callback')
    cloudinaryCallbackHandler(
        @Query() q: ICloudinaryCBRes & ICloudinaryCBErr
    ) {
        return this.productsService.handleCloudinaryCallback(q);
    }

    @Get('/:productId')
    getProduct(@Param('productId') productId: string) {
        return this.productsService.getProductById(productId);
    }

    @Patch('/:productId')
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(AuthGuard('jwt'))
    updateProduct(
        @Param('productId') productId: string,
        @GetUser() user: any,
        @Body() updateProductDto: UpdateProductDto
    ) {
        return this.productsService.updateProduct(updateProductDto, productId, user.userId);
    }

    @Delete('/')
    @UseGuards(AuthGuard('jwt'))
    removeProducts(
        @GetUser() user: any,
        @Query('id', new ParseArrayPipe({ items: String, separator: ',' }))
        productIds: string[]
    ) {
        return this.productsService.removeProducts(productIds, user.userId);
    }
}
