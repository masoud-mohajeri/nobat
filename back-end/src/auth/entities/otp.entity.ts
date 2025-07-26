import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { OtpType } from '../../common/enums/otp-type.enum';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 11 })
  @Index()
  phoneNumber: string;

  @Column()
  code: string;

  @Column({
    type: 'enum',
    enum: OtpType,
  })
  type: OtpType;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
