import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ProductImage } from './product-image.entity';
import { OrderedProduct } from '../../orders/entities/ordered-product.entity';
import { Category } from './category.entity';
import { CartProduct } from './cart-product.entity';
import { ProductStatus } from '../product.enum';
import { IUserEntity } from '../../shared/interfaces/db.interface';
import { UserRating } from '../../auth/entities/user-rating.entity';
import { FeaturedProduct } from './featured-product.entity';
import { LikedProduct } from './liked-product.entity';

@Entity()
export class Product extends BaseEntity implements IUserEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullName: string;

    @Column()
    displayName: string;

    @Column()
    description: string;

    @Column({
        type: 'decimal'
    })
    price: number;

    @Column({
        type: 'decimal',
        default: 0
    })
    priceDiscount: number;
    
    @Column({
        type: 'decimal',
        nullable: true,
    })
    public priceTobePaid: number;

    @Column({
        default: 'GHS'
    })
    currency: string;

    @Column({
        nullable: true,
        type: 'decimal'
    })
    lat: number;
    
    @Column({
        nullable: true,
        type: 'decimal'
    })
    lng: number;

    @Column({
        nullable: true
    })
    location: string;

    @Column({
        enum: ProductStatus,
        default: ProductStatus.AVAILABLE
    })
    status: ProductStatus;

    @OneToOne(() => FeaturedProduct, featured => featured.product)
    featured: FeaturedProduct;

    @OneToMany(() => ProductImage, productImage => productImage.product, {cascade: true, eager: true})
    productImages: ProductImage[];

    @OneToMany(() => OrderedProduct, orderedProduct => orderedProduct.product)
    orderedProducts: OrderedProduct[];

    @ManyToOne(() => User, user => user.products)
    user: User;
    @Column()
    userId: string;
    
    @OneToMany(() => CartProduct, cartProduct => cartProduct.product)
    public cartProducts: CartProduct[];

    @OneToMany(() => LikedProduct, likedProduct => likedProduct.product, {cascade: true})
    likingUsers: LikedProduct[];

    @ManyToMany(() => Category, { cascade: true, eager: true })
    @JoinTable({
        name: 'productCategories',
        joinColumn: { name: 'productId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id'}
    })
    productCategories: Category[];

    userRatings: UserRating[];
}

