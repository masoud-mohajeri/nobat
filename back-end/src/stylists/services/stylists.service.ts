import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StylistProfile } from '../entities/stylist-profile.entity';
import { CreateStylistProfileDto } from '../dto/create-stylist-profile.dto';
import { UpdateStylistProfileDto } from '../dto/update-stylist-profile.dto';
import { AdminApproveProfileDto } from '../dto/admin-approve-profile.dto';
import { StylistProfileStatus } from '../../common/enums/stylist-profile-status.enum';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class StylistsService {
  constructor(
    @InjectRepository(StylistProfile)
    private readonly stylistProfileRepository: Repository<StylistProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createProfile(
    userId: string,
    createStylistProfileDto: CreateStylistProfileDto,
  ): Promise<StylistProfile> {
    // Check if user exists and is a provider
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.PROVIDER) {
      throw new BadRequestException(
        'Only providers can create stylist profiles',
      );
    }

    // Check if profile already exists
    const existingProfile = await this.stylistProfileRepository.findOne({
      where: { userId },
    });

    if (existingProfile) {
      throw new BadRequestException('Stylist profile already exists');
    }

    // Create new profile
    const profile = this.stylistProfileRepository.create({
      userId,
      ...createStylistProfileDto,
      status: StylistProfileStatus.DRAFT,
    });

    return this.stylistProfileRepository.save(profile);
  }

  async getOwnProfile(userId: string): Promise<StylistProfile> {
    const profile = await this.stylistProfileRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Stylist profile not found');
    }

    return profile;
  }

  async getPublicProfile(stylistId: string): Promise<StylistProfile> {
    const profile = await this.stylistProfileRepository.findOne({
      where: { id: stylistId, status: StylistProfileStatus.APPROVED },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Stylist profile not found or not approved');
    }

    return profile;
  }

  async updateProfile(
    userId: string,
    updateStylistProfileDto: UpdateStylistProfileDto,
  ): Promise<StylistProfile> {
    const profile = await this.getOwnProfile(userId);

    // Check if profile can be updated
    if (profile.status === StylistProfileStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Cannot update profile while it is pending approval',
      );
    }

    // Update profile and reset status to draft
    Object.assign(profile, updateStylistProfileDto);
    profile.status = StylistProfileStatus.DRAFT;

    return this.stylistProfileRepository.save(profile);
  }

  async submitForApproval(userId: string): Promise<StylistProfile> {
    const profile = await this.getOwnProfile(userId);

    if (profile.status === StylistProfileStatus.APPROVED) {
      throw new BadRequestException('Profile is already approved');
    }

    if (profile.status === StylistProfileStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Profile is already pending approval');
    }

    // Submit for approval
    profile.status = StylistProfileStatus.PENDING_APPROVAL;
    profile.submittedForApprovalAt = new Date();

    return this.stylistProfileRepository.save(profile);
  }

  async adminApproveProfile(
    adminId: string,
    stylistId: string,
    adminApproveProfileDto: AdminApproveProfileDto,
  ): Promise<StylistProfile> {
    // Check if admin exists and has admin role
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can approve profiles');
    }

    const profile = await this.stylistProfileRepository.findOne({
      where: { id: stylistId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Stylist profile not found');
    }

    if (profile.status !== StylistProfileStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        'Only profiles pending approval can be approved/rejected',
      );
    }

    // Update profile status
    profile.status = adminApproveProfileDto.status;
    profile.approvedBy = adminId;
    profile.approvedAt = new Date();

    if (adminApproveProfileDto.status === StylistProfileStatus.REJECTED) {
      if (!adminApproveProfileDto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required');
      }
      profile.rejectionReason = adminApproveProfileDto.rejectionReason;
    }

    return this.stylistProfileRepository.save(profile);
  }

  async deleteProfile(userId: string): Promise<{ message: string }> {
    const profile = await this.getOwnProfile(userId);

    await this.stylistProfileRepository.remove(profile);

    return { message: 'Stylist profile deleted successfully' };
  }

  async getAllProfilesForAdmin(): Promise<StylistProfile[]> {
    return this.stylistProfileRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getProfilesByStatus(
    status: StylistProfileStatus,
  ): Promise<StylistProfile[]> {
    return this.stylistProfileRepository.find({
      where: { status },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async adminSuspendProfile(
    adminId: string,
    stylistId: string,
    reason?: string,
  ): Promise<StylistProfile> {
    // Check if admin exists and has admin role
    const admin = await this.userRepository.findOne({
      where: { id: adminId },
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can suspend profiles');
    }

    const profile = await this.stylistProfileRepository.findOne({
      where: { id: stylistId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Stylist profile not found');
    }

    profile.status = StylistProfileStatus.SUSPENDED;
    profile.rejectionReason = reason;
    profile.approvedBy = adminId;
    profile.approvedAt = new Date();

    return this.stylistProfileRepository.save(profile);
  }
}
