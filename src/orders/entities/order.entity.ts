import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { OrderedProduct } from './ordered-product.entity';
import { IUserEntity } from '../../shared/interfaces/db.interface';

@Entity()
export class Order extends BaseEntity implements IUserEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'decimal'
    })
    totalAmount: number;

    @Column()
    totalAmountPaid: string;
    
    @Column({
        type: 'decimal'
    })
    totalDiscount: number;

    @Column({
        default: 'GHS'
    })
    currency: string;

    @ManyToOne(() => User, user => user.orders)
    user: User;
    @Column()
    userId: string;

    @OneToMany(() => OrderedProduct, orderedProduct => orderedProduct.product)
    orderedProducts: OrderedProduct[];
    
}