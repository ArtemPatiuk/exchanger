import { Module } from '@nestjs/common';

import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PrismaModule, UserModule, AuthModule,ConfigModule.forRoot({isGlobal:true})],
})
export class AppModule { }
