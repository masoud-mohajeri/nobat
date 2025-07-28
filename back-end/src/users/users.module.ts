import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { CustomersController } from './controllers/customers.controller';
import { UsersService } from './services/users.service';
import { CustomerRoleGuard } from './guards/customer-role.guard';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, CustomersController],
  providers: [UsersService, CustomerRoleGuard],
  exports: [UsersService],
})
export class UsersModule {}
