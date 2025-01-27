import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/userModel.js';

// Google OAuth2 Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if the user already exists in the database
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    // Create a new user if they don't exist
                    user = new User({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        isEmailVerified: true, // Google-verified emails are considered verified
                        provider: 'google', // Track the authentication provider
                    });
                    await user.save();
                }

                // Return the user
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;