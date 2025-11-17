import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from '@prisma/prisma.service';
import { BinanceModule } from 'src/binance/binance.module';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService],
  imports:[BinanceModule]
})
export class AssetsModule {}
