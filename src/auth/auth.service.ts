import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { UserService } from '@user/user.service';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { Token, User } from 'generated/prisma';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly prismaService: PrismaService,

	) { }

	async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
		const token = await this.prismaService.token.findUnique({ where: { token: refreshToken } })
		if (!token) {
			throw new UnauthorizedException();
		}
		await this.prismaService.token.delete({ where: { token: refreshToken } })
		if (new Date(token.exp) < new Date()) {
			throw new UnauthorizedException();
		}
		const user = await this.userService.findOne(token.userId)
		return this.generatedTokens(user, agent);

	}

	async register(dto: RegisterDto) {
		const user: User = await this.userService.findOne(dto.email).catch(err => {
			this.logger.error(err);
			return null;
		})
		if (user) {
			throw new ConflictException('Користувач з таким email вже зареєстрований')
		}
		return this.userService.save(dto).catch(err => {
			this.logger.error(err);
			return null;
		})
	}


	async login(dto: LoginDto, agent: string): Promise<Tokens> {
		const user: User = await this.userService.findOne(dto.email).catch((err) => {
			this.logger.error(err);
			return null;
		});
		if (!user || !compareSync(dto.password, user.password)) {
			throw new UnauthorizedException('Не вірний логін чи пароль :(');
		}
		return this.generatedTokens(user, agent);
	}

	private async generatedTokens(user: User, agent: string): Promise<Tokens> {
		const accessToken = `Bearer ` + this.jwtService.sign({
			id: user.id,
			email: user.email,
			role: user.role
		})
		const refreshToken = await this.getRefreshToken(user.id, agent);
		return { accessToken, refreshToken }
	}

	private async getRefreshToken(userId: string, agent: string): Promise<Token> {
		const _token = await this.prismaService.token.findFirst({
			where: {
				userId,
				userAgent: agent,
			},
		});
		const token = _token?.token ?? '';
		return this.prismaService.token.upsert({
			where: { token },
			update: {
				token: v4(),
				exp: add(new Date(), { months: 1 }),
			},
			create: {
				token: v4(),
				exp: add(new Date(), { months: 1 }),
				userId,
				userAgent: agent,
			},
		});
	}

}
