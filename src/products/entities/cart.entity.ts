import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { CartProduct } from './cart-product.entity';
import { IUserEntity } from '../../shared/interfaces/db.interface';

@Entity()
export class Cart extends BaseEntity implements IUserEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, user => user.cart)
    @JoinColumn()
    user: User;
    @Column()
    userId: string;

    @OneToMany(() => CartProduct, cartProduct => cartProduct.cart, {cascade: true, eager: true})
    public cartProducts!: CartProduct[];
}
