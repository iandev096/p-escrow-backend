import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { IUserEntity } from '../../shared/interfaces/db.interface';

@Entity()
export class ContactDetail extends BaseEntity implements IUserEntity {
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    country: string;

    @Column()
    city: string;

    @Column({
        nullable: true
    })
    street: string;

    @Column({
        nullable: true
    })
    landMark: string;

    @Column({
        nullable: true
    })
    residentialAddress: string;
    
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

    @OneToOne(() => User, user => user.contactDetail, {onDelete: 'CASCADE'})
    @JoinColumn()
    user: User;
    @Column()
    userId: string;
}
