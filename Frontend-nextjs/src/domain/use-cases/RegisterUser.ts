import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

export interface RegisterUserRequest {
  email: string;
  name: string;
  password: string;
  avatar?: string;
}

export class RegisterUser {
  constructor(private userRepository: UserRepository) {}

  async execute(request: RegisterUserRequest): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = User.create({
      id: crypto.randomUUID(),
      email: request.email,
      name: request.name,
      avatar: request.avatar,
    });

    // Save user
    return await this.userRepository.save(user);
  }
}
