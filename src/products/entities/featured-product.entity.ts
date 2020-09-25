import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Unique, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity()
@Index(['id', 'productId'], {unique: true})
export class FeaturedProduct extends BaseEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Product, product => product.featured, {onDelete: 'CASCADE', eager: true})
    @JoinColumn()
    product: Product;
    @Column()
    productId: string;
}
