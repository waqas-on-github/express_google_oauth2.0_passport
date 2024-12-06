import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import "dotenv/config";

console.log(process.env.CLIENT_ID);

export const oauth20Strategy = passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK_URL,
    },
    (_accessToken, _refreshToken, profile, done) => {
      console.log("Google strategy initialized");
      if (
        !profile ||
        !profile.emails ||
        profile?.emails[0].value === undefined
      ) {
        return done(null, false);
      }
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile?.emails[0].value,
      };

      console.log(user);

      return done(null, user);
    }
  )
);
