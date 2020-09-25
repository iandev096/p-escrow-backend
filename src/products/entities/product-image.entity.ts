import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

export enum ProductImageType {
    MAIN = 'thumbnail',
    SUB = 'sub'
}


@Entity()
export class ProductImage extends BaseEntity {
    @CreateDateColumn()
    createdAt: Date;


    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: ProductImageType;

    @Column()
    url: string;

    @Column()
    publicId: string;

    @ManyToOne(() => Product, product => product.productImages, {onDelete: 'CASCADE'})
    product: Product;
    @Column()
    productId: string;

}
