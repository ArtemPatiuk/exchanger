import { Token } from 'generated/prisma/client';

export interface Tokens {
	accessToken: string;
	refreshToken: Token;
}