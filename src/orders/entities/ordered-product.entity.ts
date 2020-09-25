import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';
import { OrderedProductStatus } from '../order.enum';
import { PaymentAccount } from '../../payments/entities/payment-account.entity';


@Entity()
export class OrderedProduct extends BaseEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({
        type: 'decimal'
    })
    actualPrice: number;

    @Column({
        type: 'decimal'
    })
    paidPrice: number;

    @Column({
        type: 'decimal'
    })
    priceDiscount: number;

    @Column({
        default: 'GHS'
    })
    currency: string;

    @Column({
        enum: OrderedProductStatus,
        default: OrderedProductStatus.IN_TRANSIT
    })
    status: OrderedProductStatus

    @ManyToOne(() => Product, product => product.orderedProducts, {onDelete: 'CASCADE'})
    product: Product;
    @Column()
    productId: string;
    
    @ManyToOne(() => Order, order => order.orderedProducts, {onDelete: 'CASCADE'})
    order: Order;
    @Column()
    orderId: string;
    
    @ManyToOne(() => PaymentAccount, paymentAccount => paymentAccount.orderedProducts, {onDelete: 'SET NULL'})
    paymentAccount: PaymentAccount;
    @Column()
    paymentAccountId: string;
   
}
