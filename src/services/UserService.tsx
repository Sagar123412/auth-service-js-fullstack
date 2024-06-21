import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';

export class UserService {
  userRepository: Repository<User>;

  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }

  async create({ firstName, lastName, email, password }: UserData) {
    try {
      await this.userRepository.save({ firstName, lastName, email, password });
    } catch (error) {
      const err = createHttpError(
        500,
        'failed to register/store user in the database',
      );
      throw err;
    }
  }
}
