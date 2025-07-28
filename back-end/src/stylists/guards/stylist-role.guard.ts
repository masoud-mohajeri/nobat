import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class StylistRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.PROVIDER) {
      throw new ForbiddenException('Only stylists can access this resource');
    }

    return true;
  }
}
