import { NextFunction, Response } from 'express';
import { userRequestType } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

export class AuthController {
  userService: UserService;
  logger: Logger;

  constructor(userService: UserService, logger: Logger) {
    this.userService = userService;
    this.logger = logger;
  }

  async register(req: userRequestType, res: Response, next: NextFunction) {
    //validation
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug('new request to register a user', {
      firstName,
      lastName,
      email,
      password: '********',
    });

    try {
      await this.userService.create({ firstName, lastName, email, password });
      this.logger.info('User created successfully');
      res.status(201).send('User created');
    } catch (error) {
      this.logger.error('Error creating user', error);
      next(error);
      return;
    }
  }
}
