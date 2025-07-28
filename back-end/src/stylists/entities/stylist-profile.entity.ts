import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';

@Entity('stylist_profiles')
export class StylistProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  @Index()
  userId: string;

  @Column({ nullable: true })
  profilePhoto?: string; // File path for profile photo

  @Column({ nullable: true })
  salonAddress?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  @Column({ nullable: true })
  instagramUsername?: string;

  @Column({
    type: 'enum',
    enum: StylistProfileStatus,
    default: StylistProfileStatus.DRAFT,
  })
  status: StylistProfileStatus;

  @Column({ nullable: true })
  rejectionReason?: string; // Reason for rejection if status is REJECTED

  @Column({ nullable: true })
  approvedBy?: string; // Admin user ID who approved the profile

  @Column({ nullable: true })
  approvedAt?: Date;

  @Column({ nullable: true })
  submittedForApprovalAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
