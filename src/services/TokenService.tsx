import createHttpError from "http-errors";
import { JwtPayload, sign } from "jsonwebtoken";
import { Config } from "../config";
import { RefreshToken } from "../entity/RefreshToken";
import { User } from "../entity/User";
import { Repository } from "typeorm";

export class TokenService {
  refreshTokenRepository: Repository<RefreshToken>;

  constructor(refreshTokenRepository: Repository<RefreshToken>) {
    this.refreshTokenRepository = refreshTokenRepository;
  }

  generateAccessToken(payload: JwtPayload) {
    //private key for RS256
    let privateKey: string;

    if (!Config.PRIVATE_KEY) {
      const error = createHttpError(500, "Private is not found");
      throw error;
      return;
    }

    try {
      privateKey = Config.PRIVATE_KEY!;
    } catch (err) {
      const error = createHttpError(500, "Error while reading private key");
      throw error;
      return;
    }

    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1m",
      issuer: "auth-service",
    });

    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });
    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365; // 1Y -> (Leap year)

    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return newRefreshToken;
  }

  async deleteRefreshToken(tokenId: number) {
    return await this.refreshTokenRepository.delete({ id: tokenId });
  }
}
