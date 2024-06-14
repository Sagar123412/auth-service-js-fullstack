import { Response } from 'express';
import { userRequestType } from '../types';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';

export class AuthController {
  async register(req: userRequestType, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    const userRespository = AppDataSource.getRepository(User);
    const userService = new UserService(userRespository);
    await userService.create({ firstName, lastName, email, password });

    res.status(201).send('user created');
  }
}
