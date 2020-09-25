import { Controller, Post, UseGuards, Query, ParseArrayPipe, Delete, ParseUUIDPipe, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from '../products.service';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('carts')
export class CartsController {
    constructor(
        private productsService: ProductsService
    ) { }
    
    @Get('/')
    @UseGuards(AuthGuard('jwt'))
    getProducts(
        @GetUser() user: any
    ) {
        return this.productsService.getCartWithProducts(user.userId)
    }

    @Post('/')
    @UseGuards(AuthGuard('jwt'))
    addProduct(
        @Query('id', ParseUUIDPipe)
        productId: string,
        @GetUser() user: any
    ) {
        return this.productsService.addProductToCart(productId, user.userId);
    }

    @Delete('/')
    @UseGuards(AuthGuard('jwt'))
    removeProduct(
        @Query('id', new ParseArrayPipe({ items: String, separator: ',' }))
        productIds: string[],
        @GetUser() user: any
    ) {
        return this.productsService.removeProductsFromCart(productIds, user.userId);
    }
}
