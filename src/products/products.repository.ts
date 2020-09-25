import { EntityRepository, Repository, } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, GetProductFilterDto, ProductQueryDto } from './dto/product.dto';
import { v4 as uuid } from 'uuid';
import { LogAction } from '../shared/log/log.enum';
import { NotFoundException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { createLogHelper, authorizeUserEntitiesActions, authorizeUserEntityAction } from '../shared/utilities/db.util';
import { User } from '../auth/entities/user.entity';
import { ProductCategory } from './product.enum';
import { Category } from './entities/category.entity';
import { IProductImageGroup } from './product.interface';
import { ProductImage } from './entities/product-image.entity';
import { Cart } from './entities/cart.entity';
import { CartProduct } from './entities/cart-product.entity';
import { Log } from '../shared/log/log.entity';
import { UserRating } from '../auth/entities/user-rating.entity';
import { FeaturedProduct } from './entities/featured-product.entity';
import { LikedProduct } from './entities/liked-product.entity';

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {

  async createProduct(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    const product = new Product();
    product.id = uuid();
    product.fullName = createProductDto.fullName;
    product.displayName = createProductDto.displayName;
    product.description = createProductDto.description;
    product.price = createProductDto.price;
    product.currency = createProductDto.currency;
    product.location = createProductDto.location;
    product.lat = createProductDto?.lat;
    product.lng = createProductDto?.lng;
    product.status = createProductDto.status;
    product.priceDiscount = createProductDto.priceDiscount;
    product.userId = userId;

    const createProductLog = createLogHelper(product.userId, LogAction.CREATE_PRODUCT,
      `Product with id '${product.id}' was created`);

    try {
      await this.manager.transaction(async transactionManager => {
        try {
          await transactionManager.save([product, createProductLog]);
        } catch (err) {
          console.log(err.message)
        }
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }

    return product;
  }

  async updateProduct(updateProductDto: UpdateProductDto, productId: string, userId: string): Promise<Product> {
    const product = await Product.findOne({ id: productId });
    if (product.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this product');
    }
    if (product) {
      const updatedProduct = product;
      const updateFields = Object.entries(updateProductDto).filter(([, value]) => value);
      updateFields.forEach(([key, value]) => {
        updatedProduct[key] = value;
      });

      const updateProductLog = createLogHelper(updatedProduct.userId, LogAction.UPDATE_PRODUCT,
        `Product with id '${updatedProduct.id}' was updated. Updated fields are '${updateFields.keys}'`);

      try {
        await this.manager.transaction(async transactionManager => {
          await transactionManager.save([updatedProduct, updateProductLog]);
        });
      } catch (err) {
        throw new InternalServerErrorException(err.message);
      }
      return updatedProduct;
    } else {
      throw new NotFoundException('Product was not found');
    }
  }

  async getProductById(productId: string): Promise<Product> {
    const product = await this.findOne({ id: productId });
    return product;
  }

  async getProducts(getProductFilterDto: GetProductFilterDto): Promise<Product[]> {
    const { search, priceGt, priceLt, skip, take, location, categories, status, userId } = getProductFilterDto;
    const query = this.createQueryBuilder('product');

    if (search) {
      query.andWhere(
        '(product.fullName ILIKE :search OR product.displayName ILIKE :search OR product.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (priceGt) {
      query.andWhere(
        'product.price < :price',
        { price: priceGt }
      );
    }

    if (priceLt) {
      query.andWhere(
        'product.price > :price',
        { price: priceLt }
      );
    }

    if (location) {
      query.andWhere(
        'product.location ILIKE :location',
        { location: `%${location}%` }
      );
    }

    if (status) {
      query.andWhere(
        'product.status = :status',
        { status: status }
      );
    }

    if (userId) {
      query.andWhere(
        'product.userId = :userId',
        { userId: userId }
      );
    }

    if (skip) {
      query.skip(skip);
    }

    if (take) {
      query.take(take);
    }

    try {
      let products = await query
        .leftJoinAndSelect('product.productImages', 'productImage')
        .leftJoinAndSelect('product.productCategories', 'category')
        .leftJoinAndSelect('product.cartProducts', 'cartProduct')
        .leftJoinAndSelect('product.user', 'owner')
        .leftJoinAndMapMany('product.userRatings', UserRating, 'userRating', 'userRating.userId = product.userId')
        .getMany();

      // remember to get rid of this and incorporate this filter in the sql query rather
      if (categories && categories.length > 0) {
        products = products.filter(product => {
          const categoriesHash = categories.reduce((acc, cur) => {
            acc[cur] = true;
            return acc;
          }, {});
          const productCategories = product?.productCategories ?? []; 
          for (const cat of productCategories) {
            if (categoriesHash[cat.name]) return products;
          }
        });
      }

      return this.normalizedUsersProducts(products);
    } catch (err) {
       throw new InternalServerErrorException(err?.message ?? err)
    }
  }

  async getProductsCount() {
    return await Product.count();
  }

  async removeProducts(productIds: string[], userId: string) {
    try {
      const products = await authorizeUserEntitiesActions<Product>(
        productIds,
        userId,
        this,
        'You are not allowed to delete the(se) product(s).'
      );

      let removedProducts: Product[];
      const removeProductLog = createLogHelper(userId, LogAction.DELETE_PRODUCT,
        `Product(s) with id(s) '${productIds}' were deleted`);

      await this.manager.transaction(async transactionManager => {
        removedProducts = await transactionManager.remove(products, { listeners: true });
        await transactionManager.save(removeProductLog);
      })
      return removedProducts;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async getLikedProducts(userId: string) {
    try {

      return LikedProduct.find({userId});
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async likeProducts(productIds: string[], userId: string) {
    try {
      const user = await User.findOne(userId);

      const likedProducts = productIds.map(
        productId => LikedProduct.create({ productId, userId: user.id })
      );

      const likeProductLog = createLogHelper(userId, LogAction.LIKE_PRODUCT,
        `Product(s) with id(s) '${productIds}' were liked`);

      let savedLikedProducts: LikedProduct[];
      await this.manager.transaction(async transactionManager => {
        savedLikedProducts = await transactionManager.save(likedProducts);
        await transactionManager.save(likeProductLog);
      });

      return savedLikedProducts;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async unlikeProduct(productId: string, userId: string) {
    try {
      const product = await Product.findOne({ id: productId }, {
        relations: ['likingUsers']
      });
      const user = await User.findOne({ id: userId });
      if (!(user && product)) {
        throw new ForbiddenException('You are not allowed to perform this like operation');
      }
      if (!product.likingUsers) return null;
      const unlikedProduct = product.likingUsers.find(
        likedProduct => likedProduct.productId === productId
      );

      const unlikeProductLog = createLogHelper(userId, LogAction.UNLIKE_PRODUCT,
        `Product with id '${productId}' was unliked`);

      await this.manager.transaction(async transactionManager => {
        await transactionManager.remove(unlikedProduct);
        await transactionManager.save(unlikeProductLog);
      });

      return unlikedProduct;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async addProductsToFeatured(productIds: string[], userId: string) {
    const featuredProducts = productIds.map(productId => FeaturedProduct.create({ productId }));
    const featuredProductLog = createLogHelper(userId, LogAction.ADD_PRODUCT_TO_FEATURED,
      `Added product(s) with id(s) '${productIds}' to featured products`);
    try {
      await this.manager.transaction(async transactionManager => {
        await transactionManager.save([...featuredProducts, featuredProductLog]);
      });
      return featuredProducts;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async getFeaturedProducts(productQueryDto: ProductQueryDto) {
    const { take, skip } = productQueryDto;
    const query = this.createQueryBuilder('featuredProdut');

    if (skip) {
      query.skip(skip);
    }

    if (take) {
      query.take(take);
    }

    try {
      return await query.getMany();
    } catch (err) {
      throw new InternalServerErrorException(err?.message ?? err);
    }
  }

  async removeProductsFromFeatured(productIds: string[], userId: string) {
    const featuredProducts = await FeaturedProduct.find({
      where: productIds.map(id => ({ productId: id }))
    });
    const featuredProductLog = createLogHelper(userId, LogAction.REMOVE_PRODUCT_FROM_FEATURED,
      `Removed product(s) with id(s) '${productIds}' from featured products`);

    try {
      let removed: FeaturedProduct[]
      await this.manager.transaction(async transactionManager => {
        removed = await transactionManager.remove(featuredProducts);
        await transactionManager.save(featuredProductLog);
      });
      return removed;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async addProductCategories(productId: string, categories: ProductCategory[], userId: string) {
    try {
      const product = await authorizeUserEntityAction<Product>(
        productId,
        userId,
        this,
        'You are not allowed to change this product'
      );

      const categoriesEntitiesPromises = categories.map(
        async (category) => await Category.findOne({ name: category })
      );
      const categoriesEntities = await Promise.all(categoriesEntitiesPromises);
      const parentCategories = categoriesEntities.filter(categoryEntity => categoryEntity.parent);
      const addCategoriesLog = createLogHelper(userId, LogAction.ADD_CATEGORY,
        `Added categories '${categories}' to product with id ${product.id}`);

      const productCategories = [...product.productCategories, ...categoriesEntities, ...parentCategories];
      const removeDuplicates = (categories: Category[]) => {
        return categories.filter((category, index) => {
          const catIndex = categories.findIndex(cat => cat.id === category.id);
          return catIndex === index;
        });
      }
      product.productCategories = removeDuplicates(productCategories);

      await this.manager.transaction(async transactionManager => {
        await transactionManager.save([product, addCategoriesLog]);
      });

      return product;

    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async removeProductCategory(productId: string, category: ProductCategory, userId: string) {
    try {
      const product = await authorizeUserEntityAction<Product>(
        productId,
        userId,
        this,
        'You are not allowed to change this product'
      );

      const removeProductCatLog = createLogHelper(userId, LogAction.REMOVE_CATEGORY,
        `Product with id '${productId}' was removed`);

      if (product.productCategories) {
        product.productCategories = product.productCategories.filter(productCategory => {
          return (productCategory.name !== category);
        });

        await this.manager.transaction(async transactionManager => {
          await transactionManager.save([product, removeProductCatLog]);
        });
      }
      return product;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async addProductImages(productId: string, productImagesGroup: IProductImageGroup[], userId: string) {
    try {
      const product = await authorizeUserEntityAction<Product>(
        productId,
        userId,
        this,
        'You are not allowed to change this product'
      );

      const productImages: ProductImage[] = [];
      for (const productImageGroup of productImagesGroup) {
        const productImage = new ProductImage();
        productImage.url = productImageGroup.url;
        productImage.type = productImageGroup.type;
        productImage.publicId = productImageGroup.publicId;

        productImages.push(productImage);
      }

      product.productImages = [...product.productImages, ...productImages];
      const addProductImageLog = createLogHelper(userId, LogAction.ADD_PRODUCT_IMAGE,
        `Added productImages '${productImagesGroup}' to product with id '${productId}'`);

      await this.manager.transaction(async transactionManager => {
        await transactionManager.save([product, addProductImageLog]);
      });

      return product;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async removeProductImage(productId: string, imageId: string, userId: string) {
    try {
      const product = await authorizeUserEntityAction(
        productId,
        userId,
        this,
        'You are not allowed to remove this image'
      );

      const removeProductImageLog = createLogHelper(userId, LogAction.REMOVE_PRODUCT_IMAGE,
        `Product image with id '${imageId}' which belongs to product '${productId}' was removed`);

      if (product.productImages) {
        const removedProductImage = product.productImages.find(productImage => {
          return (productImage.id === imageId);
        })
        product.productImages = product.productImages.filter(productImage => {
          return (productImage.id !== imageId);
        });

        await this.manager.transaction(async transactionManager => {
          try {
            await transactionManager.remove(removedProductImage);
            await transactionManager.save(removeProductImageLog);
          } catch (err) {
            throw new InternalServerErrorException(err.message);
          }
        });
      }
      return product;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async addProductToCart(productId: string, userId: string) {
    try {
      let cart = await Cart.findOne({ userId: userId });
      const product = await Product.findOne({ id: productId });
      
       if (!cart) {
         cart = new Cart();
         cart.userId = userId;
         cart.cartProducts = []        
       }

      const cartProduct = new CartProduct();
      cartProduct.cartId = cart.id;
      cartProduct.productId = product.id;

      cart.cartProducts.push(cartProduct);

      const addedProductToCartLog = createLogHelper(userId, LogAction.ADD_PRODUCT_TO_CART,
        `Added product with id ${productId} to cart`);

      await this.manager.transaction(async transactionManager => {
        [cart] = await transactionManager.save([cart, addedProductToCartLog], { listeners: true }) as [Cart, Log];
      });

      return cart;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async removeProductsFromCart(productIds: string[], userId: string) {
    try {
      const cart = await Cart.findOne({ userId: userId });
      const productsSet = new Set(productIds);
      let removedCartProducts = cart.cartProducts.filter(
        cartProduct => productsSet.has(cartProduct.productId)
      );

      const removedProductsFromCartLog = createLogHelper(userId, LogAction.REMOVE_PRODUCT_FROM_CART,
        `Removed products with id(s) ${productIds} from cart`);

      await this.manager.transaction(async transactionManager => {
        removedCartProducts = await transactionManager.remove(removedCartProducts);
        await transactionManager.save(removedProductsFromCartLog);
      });

      return removedCartProducts;
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async getCartWithProducts(userId: string) {
    return await Cart.findOne({ userId: userId });
  }

  private normalizedUsersProducts(products: Product[]) {
    return products.map((product): Product => {
      const normalizedUserProduct = product;

      if (normalizedUserProduct.user) {
        normalizedUserProduct.user = this.normalizeUser(product.user);
      }
      return normalizedUserProduct;
    });
  }

  private normalizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      contactNumber: user.contactNumber,
      profilePicture: user.profilePicture
    } as User;
  }

}
