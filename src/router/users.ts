/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Request, Response, Router } from "express";
import { oauth20Strategy } from "../stratiges/oauthStratiegy";

export const router = Router();

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
  (req, res) => {
    // Return the JWT in response body
    const token = req.user;
    res.json({ token });
  }
);

// Failure route
router.get("/failure", (_req, res) => {
  res.status(401).send("Authentication failed.");
});
router.get("/", (_req: Request, res: Response) => {
  res.send("Hello World! in auth woladd");
});
