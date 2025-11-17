import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreateAssetDto {
	@IsString()
	@IsNotEmpty()
	coin: string;

	@IsString()
	@IsNotEmpty()
	network: string;

	@IsString()
	@IsNotEmpty()
	address: string;

	@IsNumber()
	withdrawFee: number;

	@IsNumber()
	withdrawMin: number;

	@IsNumber()
	depositDust: number;

	@IsString()
	@IsNotEmpty()
	networkSignature: string;

	@IsOptional()
	@IsUrl()
	imageUrl?: string;
}
