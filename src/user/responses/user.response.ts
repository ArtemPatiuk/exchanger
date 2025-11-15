import { Exclude } from 'class-transformer';
import { $Enums, User } from 'generated/prisma';

export class UserResponse implements User {
	id: string;
	email: string;

	@Exclude()
	password: string;

	role: $Enums.Role[];

	@Exclude()
	provider: 'GOOGLE';

	@Exclude()
	createdAt: Date;
	updatedAt: Date;

	constructor(user: User) {
		Object.assign(this, user)
	}
}