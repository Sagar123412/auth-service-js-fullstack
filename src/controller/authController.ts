import { NextFunction, Response } from 'express';
import { userRequestType } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';

export class AuthController {
  constructor(
    private logger: Logger,
    private userService: UserService,
  ) {}

  async register(req: userRequestType, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password } = req.body;
    try {
      await this.userService.create({ firstName, lastName, email, password });
      res.status(201).send('user created');
    } catch (err) {
      next(err);
    }
  }
}
