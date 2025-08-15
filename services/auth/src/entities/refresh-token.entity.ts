// src/domain/refresh-token.entity.ts
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid') id: string;
    @ManyToOne(() => User) user: User;
    @Index()
    @Column() token: string;            // hash hoặc random id
    @Column({ type: 'bigint' }) exp: string; // unix millis
    @CreateDateColumn() createdAt: Date;
    @Column({ default: false }) revoked: boolean;
}
