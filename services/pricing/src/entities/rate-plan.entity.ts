import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PriceEntity } from "./price.entity";

@Entity('rate_plans')
@Index(['hotelId', 'code'], { unique: true })
export class RatePlanEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 64 })
    hotelId: string;

    @Column({ type: 'varchar', length: 64 })
    code: string;

    @Column({ type: 'varchar', length: 255 })
    name: string

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    basePrice: number;

    @Column({ type: 'varchar', length: 3, default: 'USD' })
    currency: string;

    @Column({ type: 'jsonb', nullable: true })
    rules: Record<string, any>;

    @OneToMany(() => PriceEntity, price => price.ratePlan)
    prices: PriceEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}