/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from "@nestjs/common";
import { Request as RequestType } from "express";
import { PassportStrategy } from "@nestjs/passport";

import { Strategy, ExtractJwt } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "",
    });
  }

  validate(payload: any) {
    return { username: payload.username, role: payload.role };
  }

  private static extractJWT(req: RequestType): string | null {
    if (req.headers["authorization"]) {
      return req.headers["authorization"]?.split(" ")[1];
    }

    return null;
  }
}
