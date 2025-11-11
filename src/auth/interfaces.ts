import { Token } from 'generated/prisma/client';

export interface Tokens {
	accessToken: string;
	refreshToken: Token;
}

export interface JwtPayload {
	id: string,
	email: string,
	roles: string[]
}