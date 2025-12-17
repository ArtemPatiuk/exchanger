import { Exclude } from 'class-transformer';
import { $Enums, User } from '@prisma/client';

export class UserResponse{
	id: string;
	email: string;
	role: $Enums.Role[];
	updatedAt: Date;

	@Exclude()
	password: string;
	@Exclude()
	provider: 'GOOGLE';
	@Exclude()
	createdAt: Date;
	
	constructor(user: User) {
		Object.assign(this, user)
	}
}