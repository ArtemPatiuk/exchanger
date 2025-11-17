import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateAssetDto } from './dto';
import { BinanceService } from 'src/binance/binance.service';

@Injectable()
export class AssetsService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly binanceService: BinanceService

	) { }
	async getDepositAddress(coin: string, network?: string) {
		return this.binanceService.getDepositAddress(coin, network);
	}
	async getAccountIno() {
		return this.binanceService.getAccountBalances();
	}

	async sendCrypto(asset: string, amount: string, address: string, network: string) {
		return this.binanceService.sendCrypto(asset, amount, address, network);
	}


	async createAsset(dto: CreateAssetDto, userId: string) {
		const binanceData = await this.binanceService.getDepositAddress(
			dto.coin,
			dto.network,
		);

		if (!binanceData.networkInfo) {
			throw new ForbiddenException('Binance не надав інформації по мережі');
		}

		return this.prismaService.asset.create({
			data: {
				coin: dto.coin,
				network: dto.network,
				address: binanceData.address,
				networkSignature: binanceData.networkInfo.networkSignature,
				withdrawFee: parseFloat(binanceData.networkInfo.withdrawFee),
				withdrawMin: parseFloat(binanceData.networkInfo.withdrawMin),
				depositDust: parseFloat(binanceData.networkInfo.depositDust),
				createdById: userId,
				imageUrl: dto.imageUrl,
			},
		});
	}


	async getAllAssets() {
		return this.prismaService.asset.findMany({
			orderBy: { createdAt: 'desc' },
		});
	}
}
