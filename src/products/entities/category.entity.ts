import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { ProductCategory } from '../product.enum';

@Entity()
export class Category extends BaseEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        enum: ProductCategory,
        unique: true
    })
    name: ProductCategory;

    @Column({
        nullable: true
    })
    description: string;
    
    @ManyToOne(() => Category, category => category.children)
    parent: Category;

    @OneToMany(() => Category, category => category.parent)
    children: Category[];
    
    @ManyToMany(() => Product, product => product.productCategories)
    productCategories: Product[];
}
