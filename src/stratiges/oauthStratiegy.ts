import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const db = new PrismaClient();

if (
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.CALLBACK_URL
) {
  throw new Error("Missing required environment variables.");
}

// Define an interface that extends the Prisma User type

export const oauth20Strategy = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        if (!profile || !profile.emails || !profile.emails[0]?.value) {
          return done(null, false, { message: "Invalid profile data" });
        }

        const userData = {
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          givenName: profile.name?.givenName,
          familyName: profile.name?.familyName,
          picture: profile.photos?.[0]?.value,
          emailVerified: profile.emails?.[0]?.verified || false,
        };

        const user = await db.user.upsert({
          where: { email: userData.email },
          update: { googleId: userData.googleId },
          create: {
            email: userData.email,
            googleId: userData.googleId,
            username: userData.username,
            givenName: userData.givenName,
            familyName: userData.familyName,
            picture: userData.picture,
            emailVerified: userData.emailVerified,
          },
        });
        // setting user data to req.user object
        return done(null, {
          email: user.email,
          id: user.id,
          googleId: user.googleId,
          username: user.username,
          emailVerified: user.emailVerified,
        });
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error as Error, false);
      }
    }
  )
);
