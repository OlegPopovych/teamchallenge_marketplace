const passport = require("passport");
const UserService = require('../user')
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const id = profile.id;
      const email = profile.emails[0].value;
      const firstName = profile.name.givenName;
      const lastName = profile.name.familyName;
      const profilePhoto = profile.photos[0].value;


      const currentUser = await UserService.getUserByEmail({ email })
		console.log('current user by email GOOGLE', currentUser);

      if (!currentUser) {
        const newUser = await UserService.addGoogleUser({
          id,
          email,
          firstName,
          lastName,
          profilePhoto
        })
        return done(null, newUser);
      }

      if (currentUser.source != "google") {
        console.log('already used email')
        return done(null, false, { message: `You have previously signed up with a different signin method` });
      }

      currentUser.lastVisited = new Date();
      return done(null, currentUser);
    }
  )
);
