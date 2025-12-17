import { Token } from '@prisma/client';

export interface Tokens {
	accessToken: string;
	refreshToken: Token;
	user: {
		id: string
		email: string
		role: ("USER" | "ADMIN")[];
	}
}

export interface JwtPayload {
	id: string,
	email: string,
	role: string[]
}