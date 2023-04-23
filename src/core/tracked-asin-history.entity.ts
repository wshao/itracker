import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { TrackedASIN } from './tracked-asin.entity';

@Entity('tracked_asin_histories')
export class TrackedAsinHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  parentRank: number;

  @Column()
  parentCategory: string;

  @Column({ nullable: true })
  subRank: number;

  @Column({ nullable: true })
  subCategory: string;

  @Column({ nullable: true })
  isDeal: boolean;

  @Column({ nullable: true })
  hasDelightPricingBadge: boolean;

  @Column({ type: 'float', nullable: true })
  priceToPay: number;

  @Column({ type: 'float', nullable: true })
  basisPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => TrackedASIN, (trackedAsin) => trackedAsin.histories, {
    onDelete: 'CASCADE',
  })
  trackedAsin: TrackedASIN;
}
