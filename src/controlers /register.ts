import { Request, Response } from "express";
import { UserCreateSchema } from "../schema/userProfile";
import { db } from "../stratiges/oauthStratiegy";
import argon2 from "argon2";

export const register = async (req: Request, res: Response) => {
  console.log(req.body);
  const validateUser = await UserCreateSchema.safeParseAsync(req.body);
  if (!validateUser.success) {
    return res.status(400).json(validateUser.error);
  }
  //check user already exists
  const doseUserExists = await db.user.findFirst({
    where: { email: validateUser.data.email },
  });

  if (doseUserExists) {
    return res.status(400).json({ message: "User already exists" });
  }
  // hash password
  if (!validateUser.data.passwordHash) {
    return res.status(400).json({ message: "Password is required" });
  }
  const hashedPassword = await argon2.hash(validateUser.data.passwordHash);
  // create user
  const user = await db.user.create({
    data: {
      email: validateUser.data.email,
      password: hashedPassword,
      username: validateUser.data.email,
      emailVerified: false,
    },
  });
  res.json(user);
};
