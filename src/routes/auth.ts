import express from 'express';
import { AuthController } from '../controller/authController';
import logger from '../config/logger';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
const router = express.Router();

//authController instance
const userRespository = AppDataSource.getRepository(User);
const userService = new UserService(userRespository);
const auth = new AuthController(logger, userService);

router.post('/resigter', auth.register);

export default router;
