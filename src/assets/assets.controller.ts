import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto';
import { RolesGuard } from '@auth/guards/role.guard';
import { Roles } from '@common/decorators';
import { Role } from 'generated/prisma';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) { }


  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createAssets(@Body() dto: CreateAssetDto, @Req() req) {
    return this.assetsService.createAsset(dto, req.user.id)
  }

  @Get()
  getAll() {
    return this.assetsService.getAllAssets();
  }

  @Get('deposit-address')
  async getDepositAddress(@Query('coin') coin: string, @Query('network') network?: string) {
    return this.assetsService.getDepositAddress(coin, network);
  }
  @Get('account')
  async getBinanceAccount() {
    return this.assetsService.getAccountIno();
  }
}
