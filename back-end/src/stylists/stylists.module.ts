import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StylistsController } from './controllers/stylists.controller';
import { BookingLinksController } from './controllers/booking-links.controller';
import { FileUploadController } from './controllers/file-upload.controller';
import { StylistsService } from './services/stylists.service';
import { FileUploadService } from './services/file-upload.service';
import { StylistRoleGuard } from './guards/stylist-role.guard';
import { AdminRoleGuard } from './guards/admin-role.guard';
import { StylistProfile } from './entities/stylist-profile.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StylistProfile, User])],
  controllers: [
    StylistsController,
    BookingLinksController,
    FileUploadController,
  ],
  providers: [
    StylistsService,
    FileUploadService,
    StylistRoleGuard,
    AdminRoleGuard,
  ],
  exports: [StylistsService, FileUploadService],
})
export class StylistsModule {}
