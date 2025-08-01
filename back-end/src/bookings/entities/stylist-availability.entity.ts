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

@Entity('stylist_availabilities')
export class StylistAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  stylistId: string;

  // Daily work configuration
  @Column({ type: 'time', nullable: true })
  mondayStart?: string; // Format: "09:00"

  @Column({ type: 'time', nullable: true })
  mondayEnd?: string;

  @Column({ type: 'time', nullable: true })
  tuesdayStart?: string;

  @Column({ type: 'time', nullable: true })
  tuesdayEnd?: string;

  @Column({ type: 'time', nullable: true })
  wednesdayStart?: string;

  @Column({ type: 'time', nullable: true })
  wednesdayEnd?: string;

  @Column({ type: 'time', nullable: true })
  thursdayStart?: string;

  @Column({ type: 'time', nullable: true })
  thursdayEnd?: string;

  @Column({ type: 'time', nullable: true })
  fridayStart?: string;

  @Column({ type: 'time', nullable: true })
  fridayEnd?: string;

  @Column({ type: 'time', nullable: true })
  saturdayStart?: string;

  @Column({ type: 'time', nullable: true })
  saturdayEnd?: string;

  @Column({ type: 'time', nullable: true })
  sundayStart?: string;

  @Column({ type: 'time', nullable: true })
  sundayEnd?: string;

  // Slot configuration
  @Column({ type: 'int', default: 60 })
  slotDurationMinutes: number; // Default 60 minutes

  @Column({ type: 'int', default: 15 })
  bufferTimeMinutes: number; // Time between appointments

  @Column({ type: 'int', default: 120 })
  minimumNoticeMinutes: number; // Minimum notice period (default 2 hours)

  @Column({ type: 'int', default: 90 })
  maxAdvanceDays: number; // Maximum days in advance for booking

  @Column({ default: true })
  allowMultipleClients: boolean; // Can serve multiple clients simultaneously

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stylistId' })
  stylist: User;
}
