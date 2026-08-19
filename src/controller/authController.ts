import { NextFunction, Response } from "express";
import { AuthRequest, RegisterUserRequest } from "../types";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";
import { roles } from "../constants";

export class AuthController {
  userService: UserService;
  logger: Logger;
  tokenService: TokenService;
  credentialService: CredentialService;

  constructor(
    userService: UserService,
    logger: Logger,
    tokenService: TokenService,
    credentialService: CredentialService,
  ) {
    this.userService = userService;
    this.logger = logger;
    this.tokenService = tokenService;
    this.credentialService = credentialService;
  }

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //validation
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const err = createHttpError(400, result.array()[0].msg as string);
      return next(err);
    }

    const { firstName, lastName, email, password } = req.body;

    this.logger.debug("new request to register a user", {
      firstName,
      lastName,
      email,
      password: "********",
    });

    try {
      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: roles.CUSTOMER,
      });
      this.logger.info("User created successfully", user.id);

      //generated access token using JWT RS256 encoding method

      //jwt payload
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      //Refresh token generation using HS256

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      //access token and refresh token sending in cookies
      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 1, // 1d
        httpOnly: true, // Very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true, // Very important
      });

      res
        .status(201)
        .send({ message: "User created successfully", UserId: user.id });
    } catch (error) {
      this.logger.error("Error creating user", error);
      next(error);
      return;
    }
  }

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    //validation
    const result = validationResult(req);

    if (!result.isEmpty()) {
      const err = createHttpError(400, result.array()[0].msg as string);
      return next(err);
    }

    const { email, password } = req.body;

    this.logger.debug("new request to login a user", {
      email,
      password: "********",
    });

    try {
      //check if email exits in the database
      const user = await this.userService.findByEmailWithPassword(email);

      if (!user) {
        const err = createHttpError(400, "Email or password is not valid");
        next(err);
        return;
      }

      //compare password

      const passwordMatch = await this.credentialService.comparePassword(
        password,
        user.password,
      );

      if (!passwordMatch) {
        const err = createHttpError(400, "Email or password is not valid");
        next(err);
        return;
      }

      // generated tokens and send token in the cookie

      //generated access token using JWT RS256 encoding method

      //jwt payload
      const payload: JwtPayload = {
        sub: String(user.id),
        role: user.role,
        tenant: user.tenant ? String(user.tenant.id) : "",
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      //Refresh token generation using HS256

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      //access token and refresh token sending in cookies
      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60, // 1m
        httpOnly: true, // Very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true, // Very important
      });

      this.logger.info("user has been loged in", { id: user.id });

      res.status(200).send({ message: "User Has been login", id: user.id });
    } catch (error) {
      this.logger.error("Error creating user", error);
      next(error);
      return;
    }
  }

  async self(req: AuthRequest, res: Response) {
    // token req.auth.id
    const user = await this.userService.findById(Number(req.auth.sub));
    res.json({ ...user, password: undefined });
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    //if refresh token is validated, we will rotate the refresh token
    try {
      const payload: JwtPayload = {
        sub: req.auth.sub,
        role: req.auth.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      const user = await this.userService.findById(Number(req.auth.sub));
      if (!user) {
        const error = createHttpError(
          400,
          "User with the token could not find",
        );
        next(error);
        return;
      }

      // Persist the refresh token
      const newRefreshToken = await this.tokenService.persistRefreshToken(user);

      // Delete old refresh token
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h
        httpOnly: true, // Very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1y
        httpOnly: true, // Very important
      });

      this.logger.info("User has been logged in", { id: user.id });
      res.json({ id: user.id });
    } catch (err) {
      next(err);
      return;
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await this.tokenService.deleteRefreshToken(Number(req.auth.id));
      this.logger.info("Refresh token has been deleted", {
        id: req.auth.id,
      });

      this.logger.info("User has been logged out", { id: req.auth.sub });

      //clearing cookies after logging out the user
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      res.json({});
    } catch (err) {
      next(err);
      return;
    }
  }
}
