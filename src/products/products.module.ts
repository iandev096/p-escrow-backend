import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './controllers/products.controller';
import { CartsController } from './controllers/carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './products.repository';
import { Log } from '../shared/log/log.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/entities/user.entity';
import { Category } from './entities/category.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ProductImageSubscriber } from './entity-subscribers/product-image.subscriber';
import { ProductImage } from './entities/product-image.entity';
import { Cart } from './entities/cart.entity';
import { CartProduct } from './entities/cart-product.entity';
import { ProductSubscriber } from './entity-subscribers/product.subscriber';
import { UserRating } from '../auth/entities/user-rating.entity';
import { FeaturedProduct } from './entities/featured-product.entity';
import { LikedProduct } from './entities/liked-product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRepository,
      FeaturedProduct,
      LikedProduct,
      ProductImage,
      Log, 
      User,
      UserRating,
      Category,
      Cart,
      CartProduct
    ]),
    AuthModule,
    CloudinaryModule
  ],
  providers: [
    ProductsService,
    ProductImageSubscriber,
    ProductSubscriber,
  ],
  controllers: [ProductsController, CartsController]
})
export class ProductsModule {}
