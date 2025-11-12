import { JwtPayload } from '@auth/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { genSaltSync, hashSync } from 'bcrypt';
import { Cache } from 'cache-manager';
import { Role, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import 'dotenv/config';
import { convertToSecondsUtil } from '@common/utils';


@Injectable()
export class UserService {
	constructor(
		private readonly prismaService: PrismaService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private readonly configService: ConfigService
	) { }

	save(user: Partial<User>) {
		if (!user.email || !user.password) {
			throw new Error('Email and password are required');
		}
		const hashedPassword = this.PasswordToHash(user.password);
		return this.prismaService.user.create({
			data: {
				email: user.email,
				password: hashedPassword,
				role: ['USER']
			}
		})
	}
	async findOne(idOrEmail: string, isReset = false) {
		if (isReset) {
			await this.cacheManager.del(idOrEmail);
		}
		const user = await this.cacheManager.get<User>(idOrEmail);
		if (!user) {
			const user = await this.prismaService.user.findFirst({
				where: {
					OR: [{ id: idOrEmail }, { email: idOrEmail }]
				}
			});
			if (!user) {
				return null;
			}
			await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')))
			return user;
		}
		return user
	}

	async delete(id: string, user: JwtPayload) {
		if (user.id !== id && !user.role.includes(Role.ADMIN)) {
			throw new ForbiddenException();
		}
		await Promise.all([
			await this.cacheManager.del(id),
			await this.cacheManager.del(user.email)
		])

		return this.prismaService.user.delete({ where: { id }, select: { id: true } });
	}


	private PasswordToHash(password: string) {
		return hashSync(password, genSaltSync(10))
	}

}

