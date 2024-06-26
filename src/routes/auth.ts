import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controller/authController';
import logger from '../config/logger';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import registerValidators from '../validators/register-validators';
import { TokenService } from '../services/TokenService';
const router = express.Router();

//authController instance
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const tokenService = new TokenService();

// Instantiate AuthController with logger and userService
const authController = new AuthController(userService, logger, tokenService);

router.post(
  '/resigter',
  registerValidators,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next);
  },
);

export default router;
