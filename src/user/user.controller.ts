import { Body, Controller, Get, Param, Post, Delete, ParseUUIDPipe, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponse } from './responses';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':idOrEmail')
  async findOneUser(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.userService.findOne(idOrEmail);
    return new UserResponse(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Delete(":id")
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);

  }

}
