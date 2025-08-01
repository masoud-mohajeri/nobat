import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stylist_exceptions')
export class StylistException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  stylistId: string;

  @Column({ type: 'date' })
  @Index()
  date: Date; // The date when stylist is unavailable

  @Column({ type: 'time', nullable: true })
  startTime?: string; // If null, entire day is blocked

  @Column({ type: 'time', nullable: true })
  endTime?: string; // If null, entire day is blocked

  @Column({ nullable: true })
  reason?: string; // Optional reason for the exception

  @Column({ default: false })
  isRecurring: boolean; // For recurring exceptions (e.g., every Monday)

  @Column({ type: 'int', nullable: true })
  recurringDayOfWeek?: number; // 0-6 (Sunday-Saturday) for recurring exceptions

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stylistId' })
  stylist: User;
}
