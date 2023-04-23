import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Market } from './market.entity';
import { TrackedAsinStatus } from "./tracked-asin-status.enum";
import { TrackedAsinHistory } from "./tracked-asin-history.entity";

@Entity('tracked_asins')
export class TrackedASIN {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  asin: string;

  @Column({ type: 'enum', enum: TrackedAsinStatus, default: TrackedAsinStatus.ACTIVE })
  status: TrackedAsinStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TrackedAsinHistory, (history) => history.trackedAsin)
  histories: TrackedAsinHistory[];
}
