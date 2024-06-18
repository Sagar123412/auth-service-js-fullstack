import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  //put it into try catch block
  async create({ firstName, lastName, email, password }: UserData) {
    await this.userRepository.save({ firstName, lastName, email, password });
  }
}
