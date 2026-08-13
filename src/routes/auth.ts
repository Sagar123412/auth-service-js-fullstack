import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "../controller/authController";
import logger from "../config/logger";
import { UserService } from "../services/UserService";
import { User } from "../entity/User";
import { AppDataSource } from "../config/data-source";
import registerValidators from "../validators/register-validators";
import { TokenService } from "../services/TokenService";
import { RefreshToken } from "../entity/RefreshToken";
import loginValidators from "../validators/login-validators";
import { CredentialService } from "../services/CredentialService";
import authenticate from "../middlewares/authenticate";
import { AuthRequest } from "../types";
import validateRefreshToken from "../middlewares/validateRefreshToken";
import parseRefreshToken from "../middlewares/parseRefreshToken";
const router = express.Router();

//authController instance
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository, logger);

const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const credService = new CredentialService();

// Instantiate AuthController with logger and userService
const authController = new AuthController(
  userService,
  logger,
  tokenService,
  credService,
);

router.post(
  "/register",
  registerValidators,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.register(req, res, next);
  },
);

router.post(
  "/login",
  loginValidators,
  async (req: Request, res: Response, next: NextFunction) => {
    await authController.login(req, res, next);
  },
);

router.get("/self", authenticate, (req: Request, res: Response) =>
  authController.self(req as AuthRequest, res),
);

router.post(
  "/refresh",
  validateRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.refresh(req as AuthRequest, res, next),
);

router.post(
  "/logout",
  authenticate,
  parseRefreshToken,
  (req: Request, res: Response, next: NextFunction) =>
    authController.logout(req as AuthRequest, res, next),
);

export default router;
