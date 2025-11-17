import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Spot, SPOT_REST_API_PROD_URL } from '@binance/connector';

@Injectable()
export class BinanceService {
	private client: Spot;

	private coinConfigCache: any = null;
	private lastCacheUpdate = 0;
	private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 час

	constructor() {
		console.log('BINANCE_API_KEY:', process.env.BINANCE_API_KEY);
		console.log('BINANCE_API_SECRET:', process.env.BINANCE_API_SECRET);

		this.client = new Spot(
			process.env.BINANCE_API_KEY ?? '',
			process.env.BINANCE_API_SECRET ?? '',
			{ adjustTime: true }
		);

		console.log('Binance Spot client initialized:', !!this.client);
	}


	async getAccountBalances() {
		try {
			const response = await this.client.signRequest('GET', '/api/v3/account');
			return response.data;
		} catch (error) {
			throw new Error('Не удалось получить данные аккаунта Binance');
		}
	}



	async getCoinConfig() {
		try {
			const now = Date.now();
			if (!this.coinConfigCache || now - this.lastCacheUpdate > this.CACHE_DURATION) {
				const response = await this.client.signRequest('GET', '/sapi/v1/capital/config/getall');
				this.coinConfigCache = response.data;
				this.lastCacheUpdate = now;
			}
			return this.coinConfigCache;
		} catch (error) {
			console.error('Error fetching coin config:', error.response?.data || error);
			throw new InternalServerErrorException('Не удалось получить конфиг монет с Binance');
		}
	}

	getNetworkInfo(coinConfig: any[], coin: string, network: string) {
		const coinInfo = coinConfig.find(c => c.coin === coin);
		if (!coinInfo) return null;

		const net = coinInfo.networkList.find(n => n.network === network);
		if (!net) return null;

		return {
			networkSignature: net.name,
			withdrawFee: net.withdrawFee,
			withdrawMin: net.withdrawMin,
			depositDust: net.depositDust,
		};
	}

	async getDepositAddress(coin: string, network?: string) {
		try {
			const options: any = {};
			if (network) options.network = network;

			const addrResponse = await this.client.depositAddress(coin, options);
			const coinConfig = await this.getCoinConfig();
			const networkInfo = this.getNetworkInfo(coinConfig, coin, network);

			return {
				...addrResponse.data,
				networkInfo,
			};
		} catch (error) {
			console.error('Error fetching deposit address:', error.response?.data || error);
			throw new InternalServerErrorException('Не удалось получить адрес депозита с Binance');
		}
	}

	async sendCrypto(asset: string, amount: string, address: string, network: string) {
		try {
			const response = await this.client.withdraw(asset, address, amount, { network });
			return response.data;
		} catch (error) {
			console.error('Error sending crypto:', error.response?.data || error);
			throw new InternalServerErrorException('Не удалось отправить криптовалюту');
		}
	}
}
