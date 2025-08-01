import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { FileUploadService } from '../services/file-upload.service';
import { UploadProfilePhotoDto } from '../dto/upload-profile-photo.dto';

@ApiTags('stylists')
@Controller('api/v1/stylists')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file uploaded or invalid file' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth('JWT-auth')
  @Post('profile/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  @HttpCode(HttpStatus.OK)
  async uploadProfilePhoto(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadProfilePhotoDto: UploadProfilePhotoDto,
  ) {
    // TODO: Implement actual file upload logic
    // This will:
    // 1. Validate the uploaded file
    // 2. Save it to local storage
    // 3. Update the stylist profile with the photo path
    // 4. Return the file URL

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Placeholder implementation
    return {
      message: 'Profile photo upload endpoint - not implemented yet',
      filename: file.originalname,
      size: file.size,
    };
  }
}
