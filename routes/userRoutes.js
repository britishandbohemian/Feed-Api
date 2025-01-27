
import { body, param } from 'express-validator';
import express from 'express';
import passport from 'passport';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    refreshToken,
    registerUser,
    loginUser,
    logoutUser,
    verifyEmailOtp,
    resendEmailOtp,
    requestPasswordReset,
    resetPassword,
} from '../controllers/userController.js';

const router = express.Router();

// Google OAuth Routes
router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect or respond with a token
        const token = generateToken(req.user._id);
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 1000, // 1 hour
        });
        res.redirect('/home');
    }
);

// Existing routes
router.post(
    '/auth/register',
    [
        body('username')
            .isLength({ min: 3 })
            .withMessage('Username must be at least 3 characters long.'),
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address.'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long.'),
    ],
    registerUser
);



// Debug imported controllers
console.log('registerUser:', registerUser);
console.log('loginUser:', loginUser);
console.log('verifyEmailOtp:', verifyEmailOtp);

/**
 * ============================
 *        Authentication
 * ============================
 */
router.post(
  '/auth/register',
  [
    body('username')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long.'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
  ],
  registerUser
);

router.post(
  '/auth/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .exists()
      .withMessage('Password is required.'),
  ],
  loginUser
);

router.post('/auth/logout', logoutUser);

/**
 * ============================
 *      Email Verification
 * ============================
 */
router.post(
  '/auth/verify-email',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.'),
  ],
  verifyEmailOtp
);

router.post(
  '/auth/resend-otp',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
  ],
  resendEmailOtp
);

/**
 * ============================
 *     Password Management
 * ============================
 */
router.post(
  '/auth/request-password-reset',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
  ],
  requestPasswordReset
);

router.post(
  '/auth/reset-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('otp')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be exactly 6 digits.'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long.'),
  ],
  resetPassword
);

/**
 * ============================
 *      User Management
 * ============================
 */
router.get('/', getAllUsers);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID format.')],
  getUserById
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID format.'),
    body('username')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long.'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email address.'),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.'),
  ],
  updateUser
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID format.')],
  deleteUser
);

export default router;