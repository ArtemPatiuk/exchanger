import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService],
  imports: [CacheModule.register()]
})
export class UserModule { }
