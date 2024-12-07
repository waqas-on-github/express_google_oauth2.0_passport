/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Request, Response, Router } from "express";
import { oauth20Strategy } from "../stratiges/oauthStratiegy";
import { generateAccessToken } from "../utils/jwt_helpers";
import { requireAuth } from "../middlewares/isAuth";
import { register } from "../controlers /register";
import { login } from "../controlers /login";

export const router = Router();

// Create a type that matches the User model structure
type UserAuthType = {
  id: number;
  email: string;
  googleId: string | null;
  username: string | null;
  emailVerified: boolean;
};

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface User extends UserAuthType {}
  }
}

// Extend the Request interface
interface CustomRequest extends Request {
  user?: UserAuthType;
}

router.get(
  "/google",
  oauth20Strategy.authenticate("google", {
    scope: ["profile", "email"], // These define what data we want access to from Google
  })
);

// Google callback route
router.get(
  "/callback",
  oauth20Strategy.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  (req: CustomRequest, res: Response) => {
    // Return the JWT in response body

    if (!req.user) {
      res.status(401).send("Authentication failed.");
      return;
    }

    const token = generateAccessToken({
      email: req.user.email,
      id: req.user.id,
    });

    res.json({ token });
  }
);

// Failure route
router.get("/failure", (req, res) => {
  res.status(401).send("Authentication failed.");
});

router.get("/authed", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

router.post("/register", register);
router.post("/login", login);