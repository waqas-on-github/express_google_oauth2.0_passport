import { Request, Response } from "express";
import { db } from "../stratiges/oauthStratiegy";
import { UserLoginSchema } from "../schema/userProfile";
import argon2 from "argon2";
import { generateAccessToken } from "../utils/jwt_helpers";

export const login = async (req: Request, res: Response) => {
  console.log(req.body);
  const validateCredentials = await UserLoginSchema.safeParseAsync(req.body);
  if (!validateCredentials.success) {
    return res.status(400).json(validateCredentials.error);
  }

  // check user exists
  const user = await db.user.findFirst({
    where: { email: validateCredentials.data.email },
  });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.password) {
    return res.status(400).json({ message: "Password is required" });
  }
  // check password
  const isPasswordCorrect = await argon2.verify(
    user.password,
    validateCredentials.data.passwordHash
  );

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  // generate access token
  const token = generateAccessToken({
    email: user.email,
    id: user.id,
  });

  res.json({ token });
};
