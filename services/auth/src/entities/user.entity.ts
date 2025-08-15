// src/domain/user.entity.ts
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Index({ unique: true })
    @Column() email: string;

    @Column() fullName: string;

    @Column() passwordHash: string;

    @Column({ default: true }) isActive: boolean;

    @CreateDateColumn() createdAt: Date;
    @UpdateDateColumn() updatedAt: Date;
}
