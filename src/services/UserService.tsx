import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { LimitedUserData, UserData } from '../types';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

export class UserService {
  userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async create({ firstName, lastName, email, password, role }: UserData) {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });

    if (user) {
      const err = createHttpError(400, 'Email is already exists!');
      throw err;
    }

    const saltRound = 10;
    const hanshedPassword = await bcrypt.hash(password, saltRound);

    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hanshedPassword,
        role,
      });
    } catch (error) {
      const err = createHttpError(
        500,
        'failed to register/store user in the database',
      );
      throw err;
    }
  }

  // async findByEmail(email: string) {
  //   return await this.userRepository.findOne({
  //     where: {
  //       email,
  //     },
  //   });
  // }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'role', 'password'],
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(userId: number, { firstName, lastName, role }: LimitedUserData) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
      });
    } catch (err) {
      const error = createHttpError(
        500,
        'Failed to update the user in the database',
      );
      throw error;
    }
  }

  async getAll() {
    return await this.userRepository.find();
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
