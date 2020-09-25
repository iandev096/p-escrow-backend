import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserRating {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({
        type: 'decimal',
        precision: 3,
        scale: 2,
    })
    rating: number;

    @Column({
        nullable: true
    })
    comment: string;

    @ManyToOne(() => User, user => user.ratings)
    user: User;
    @Column()
    userId: string;
}
