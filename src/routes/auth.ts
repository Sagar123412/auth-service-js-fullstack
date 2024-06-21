import express from 'express';
import { AuthController } from '../controller/authController';
import logger from '../config/logger';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
const router = express.Router();

//authController instance
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

// Instantiate AuthController with logger and userService
const authController = new AuthController(userService, logger);

router.post('/resigter', async (req, res, next) => {
  await authController.register(req, res, next);
});

export default router;
