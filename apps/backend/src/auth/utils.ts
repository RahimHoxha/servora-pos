import { JwtService } from "@nestjs/jwt";
import { Company } from "../company/company.entity";
import { Response } from "express";
// import { ELangType } from "../../constants";

export class AuthTokenDto {
  accessToken: string;
  refreshToken: string;
}

export const getTokens = async (
  company: Company,
  jwtService: JwtService
): Promise<AuthTokenDto> => {
  const tokens = await Promise.all([
    jwtService.signAsync(
      { id: company.id },
      {
        expiresIn: "3600s",
        secret: process.env.JWT_SECRET,
      }
    ),
    jwtService.signAsync(
      { id: company.id },
      {
        expiresIn: "7d",
        secret: process.env.REFRESH_JWT_SECRET,
      }
    ),
  ]);

  return {
    accessToken: tokens[0],
    refreshToken: tokens[1],
  };
};

export const removeTokenFromCookie = (res: Response) => {
  res.clearCookie("access_token", { sameSite: "none", secure: true });
  res.clearCookie("refresh_token", { sameSite: "none", secure: true });
  res.clearCookie("language", { sameSite: "none", secure: true });
};

export const storeTokenInCookie = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    expires: accessToken ? new Date(Date.now() + 24 * 3600000) : undefined,
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    expires: refreshToken ? new Date(Date.now() + 7 * 24 * 3600000) : undefined,
  });
};

// export const setLanguageCookie = (res: Response, lang: ELangType) => {
//   res.cookie("language", lang, {
//     httpOnly: true,
//     sameSite: "none",
//     secure: true,
//     expires: new Date(Date.now() + 1 * 24 * 3600000),
//   });
// };
