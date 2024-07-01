import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
  userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async create({ firstName, lastName, email, password }: UserData) {
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
        role: roles.CUSTOMER,
      });
    } catch (error) {
      const err = createHttpError(
        500,
        'failed to register/store user in the database',
      );
      throw err;
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findById(id: number) {
    return await this.userRepository.findOne({
        where: {
            id,
        },
    });
}
}
