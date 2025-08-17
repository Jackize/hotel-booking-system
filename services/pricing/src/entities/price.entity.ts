import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { RatePlanEntity } from "./rate-plan.entity";

@Entity('prices')
@Unique(['ratePlanId', 'date', 'roomTypeId'])
export class PriceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'uuid' })
    ratePlanId: string;
    
    @Column({ type: 'varchar' }) 
    roomTypeId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 3, default: 'USD' })
    currency: string;

    @Column({ type: 'date' })
    date: Date;

    @Column({ type: 'jsonb', nullable: true })
    conditions: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => RatePlanEntity, ratePlan => ratePlan.prices)
    @JoinColumn({ name: 'ratePlanId' })
    ratePlan: RatePlanEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}