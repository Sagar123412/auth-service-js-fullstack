import { NextFunction, Response } from 'express';
import { userRequestType } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';

export class AuthController {
  userService: UserService;
  logger: Logger;
  tokenService: TokenService;

  constructor(
    userService: UserService,
    logger: Logger,
    tokenService: TokenService,
  ) {
    this.userService = userService;
    this.logger = logger;
    this.tokenService = tokenService;
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
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info('User created successfully', user.id);

      //generated access token using JWT RS256 encoding method

      //jwt payload
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token
      const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

      const newRefreshToken = await refreshTokenRepository.save({
        user: user,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      //Refresh token generation using HS256

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      //access token and refresh token sending in cookies
      res.cookie('accessToken', accessToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1d
        httpOnly: true, // Very important
      });

      res.cookie('refreshToken', refreshToken, {
        domain: 'localhost',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true, // Very important
      });

      res.status(201).send('User created');
    } catch (error) {
      this.logger.error('Error creating user', error);
      next(error);
      return;
    }
  }
}
