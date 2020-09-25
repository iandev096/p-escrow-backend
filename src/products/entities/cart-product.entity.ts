import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index } from "typeorm";
import { Cart } from "./cart.entity";
import { Product } from "./product.entity";

@Entity()
@Index(['cartId', 'productId'], {unique: true})
export class CartProduct {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public cartId!: string;

    @Column()
    public productId!: string;

    @ManyToOne(() => Cart, cart => cart.cartProducts)
    @JoinColumn({name: 'cartId'})
    public cart!: Cart;

    @ManyToOne(() => Product, product => product.cartProducts, {onDelete: 'CASCADE', eager: true})
    @JoinColumn({name: 'productId'})
    public product!: Product;
}
