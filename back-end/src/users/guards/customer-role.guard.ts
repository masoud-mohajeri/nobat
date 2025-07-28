import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CustomerRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Allow customers (USER role) and admins to access customer endpoints
    return user.role === UserRole.USER || user.role === UserRole.ADMIN;
  }
}
