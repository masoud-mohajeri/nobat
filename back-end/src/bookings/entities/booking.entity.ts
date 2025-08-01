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
import { BookingStatus } from '../../common/enums/booking-status.enum';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  stylistId: string;

  @Column({ type: 'uuid' })
  @Index()
  customerId: string;

  @Column({ type: 'date' })
  @Index()
  bookingDate: Date;

  @Column({ type: 'time' })
  startTime: string; // Format: "14:30"

  @Column({ type: 'time' })
  endTime: string; // Format: "15:30"

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  depositAmount?: number; // Amount paid as deposit

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount?: number; // Total service amount

  @Column({ nullable: true })
  customerNotes?: string; // Notes from customer

  @Column({ nullable: true })
  stylistNotes?: string; // Notes from stylist

  @Column({ nullable: true })
  cancellationReason?: string; // Reason if cancelled

  @Column({ nullable: true })
  cancelledBy?: string; // Who cancelled (customer/stylist)

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  rescheduledFrom?: string; // Original booking ID if rescheduled

  @Column({ nullable: true })
  confirmedAt?: Date;

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  reminderSentAt?: Date; // 24h reminder sent timestamp

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stylistId' })
  stylist: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: User;
}
