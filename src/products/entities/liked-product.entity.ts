import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, Index, BaseEntity } from "typeorm";
import { Product } from "./product.entity";
import { User } from "../../auth/entities/user.entity";
import { IUserEntity } from "../../shared/interfaces/db.interface";

@Entity()
@Index(['userId', 'productId'], {unique: true})
export class LikedProduct extends BaseEntity implements IUserEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn()
    public id!: number;

    @ManyToOne(() => User, user => user.likedProducts)
    @JoinColumn({name: 'userId'})
    public user!: User;
    @Column()
    public userId!: string;

    @ManyToOne(() => Product, product => product.cartProducts, {onDelete: 'CASCADE', eager: true})
    @JoinColumn({name: 'productId'})
    public product!: Product;
    @Column()
    public productId!: string;
}
