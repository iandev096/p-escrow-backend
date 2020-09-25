import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { IUserEntity } from "../interfaces/db.interface";

@Entity()
export class Log extends BaseEntity implements IUserEntity {
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    action: string;
    
    @Column({
        nullable: true
    })
    description: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(() => User, user => user.logs, {onDelete: 'SET NULL'})
    user: User;
    @Column({
        nullable: true
    })
    userId: string;
}