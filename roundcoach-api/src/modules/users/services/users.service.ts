import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateMeDto } from '../dtos/update-me.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<User> {
    return this.usersRepository.create(data);
  }

  async updateMe(id: string, dto: UpdateMeDto): Promise<User> {
    await this.getById(id);
    return this.usersRepository.update(id, dto);
  }
}
