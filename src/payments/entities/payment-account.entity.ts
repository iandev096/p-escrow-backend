import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { PaymentAccountCategory } from '../payment.enum';
import { User } from '../../auth/entities/user.entity';
import { OrderedProduct } from '../../orders/entities/ordered-product.entity';
import { IUserEntity } from '../../shared/interfaces/db.interface';

@Entity()
export class PaymentAccount implements IUserEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @PrimaryGeneratedColumn('uuid')
    id: string;

    // could be a credit card no. or contact no. etc
    @Column()
    paymentIdentifier: string;

    @Column()
    category: PaymentAccountCategory;

    // could be the bank's name or the telco's name
    @Column()
    providerName: string;

    @Column({
        nullable: true
    })
    branchName: string;

    @OneToMany(() => OrderedProduct, orderedProduct => orderedProduct.paymentAccount, { cascade: true })
    orderedProducts: OrderedProduct[];
    
    @ManyToOne(() => User, user => user.paymentAccounts)
    user: User;
    @Column()
    userId: string;

}
