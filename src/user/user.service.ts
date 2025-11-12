import { JwtPayload } from '@auth/interfaces';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { genSaltSync, hashSync } from 'bcrypt';
import { Role, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) { }

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
	async findOne(idOrEmail: string) {
		return this.prismaService.user.findFirst({
			where: {
				OR: [{ id: idOrEmail }, { email: idOrEmail }]
			}
		})
	}

	async delete(id: string, user: JwtPayload) {
		if (user.id !== id && !user.role.includes(Role.ADMIN)) {
			throw new ForbiddenException();
		}
		return this.prismaService.user.delete({ where: { id }, select: { id: true } });
	}


	private PasswordToHash(password: string) {
		return hashSync(password, genSaltSync(10))
	}

}

