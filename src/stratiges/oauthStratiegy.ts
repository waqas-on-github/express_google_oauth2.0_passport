import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config";
import { PrismaClient, User } from "@prisma/client";

const db = new PrismaClient();

if (
  !process.env.CLIENT_ID ||
  !process.env.CLIENT_SECRET ||
  !process.env.CALLBACK_URL
) {
  throw new Error("Missing required environment variables.");
}

// Define an interface that extends the Prisma User type
interface ExtendedUser extends User {
  id: number; // Explicitly define id
}

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
          name: profile.displayName,
          email: profile.emails[0].value,
          givenName: profile.name?.givenName,
          familyName: profile.name?.familyName,
          picture: profile.photos?.[0]?.value,
          emailVerified: profile.emails?.[0]?.verified || false,
        };

        const user: ExtendedUser = await db.user.upsert({
          where: { email: userData.email },
          update: { googleId: userData.googleId },
          create: {
            email: userData.email,
            googleId: userData.googleId,
            name: userData.name,
            givenName: userData.givenName,
            familyName: userData.familyName,
            picture: userData.picture,
            emailVerified: userData.emailVerified,
          },
        });

        return done(null, user);
      } catch (error) {
        console.error("Error in Google Strategy:", error);
        return done(error as Error, false);
      }
    }
  )
);
