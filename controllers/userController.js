import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import EmailService from '../utils/emailService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ValidationError, NotFoundError } from '../utils/customErrors.js';

// ================================
//    Helper Functions
// ================================
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

// ================================
//    Basic CRUD for Users
// ================================

// 1) Get All Users (READ all)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(users);
});

// 2) Get User by ID (READ one)
export const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found.`);
  }

  res.status(200).json(user);
});

// 3) Update User (UPDATE)
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { username, email, password } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found.`);
  }

  if (username) user.username = username;
  if (email) user.email = email;
  if (password) user.password = password;

  await user.save();

  res.status(200).json({ message: 'User updated successfully.' });
});

// 4) Delete User (DELETE)
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found.`);
  }

  await user.deleteOne();
  res.status(200).json({ message: 'User deleted successfully.' });
});

// ================================
//    Auth & Sessions
// ================================

// Refresh Token
export const refreshToken = asyncHandler(async (req, res) => {
  const refreshTokenValue = req.cookies?.refresh_token;
  if (!refreshTokenValue) {
    throw new ValidationError('Refresh token not provided. Please log in again.');
  }

  const decoded = jwt.verify(refreshTokenValue, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ValidationError('Invalid refresh token. Please log in again.');
  }

  const newAccessToken = generateToken(user._id);
  res.cookie('access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.json({ success: true, accessToken: newAccessToken });
});

// Register User (CREATE)
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ValidationError('Please provide username, email, and password.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('Email is already in use. Please use a different email.');
  }

  const user = new User({ username, email, password });
  const otp = user.setEmailOtp();
  await user.save();

  await EmailService.sendEmail({
    to: email,
    subject: 'Verify Your Email',
    text: `Your OTP is: ${otp}. Please enter this OTP to verify your email.`,
  });

  res.status(201).json({
    message: 'User registered successfully. Please verify your email.',
  });
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Please provide both email and password.');
  }

  const user = await User.findOne({ email }).select('+password +isEmailVerified');
  if (!user) {
    throw new ValidationError('No account found with this email. Please register.');
  }

  if (!(await user.validatePassword(password))) {
    throw new ValidationError('Incorrect password. Please try again.');
  }

  if (!user.isEmailVerified) {
    throw new ValidationError('Your email is not verified. Please verify your email to log in.');
  }

  const token = generateToken(user._id);
  const refreshTokenVal = generateRefreshToken(user._id);

  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  res.cookie('refresh_token', refreshTokenVal, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({ message: 'Login successful.' });
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully.' });
});

// ================================
//    Email Verification
// ================================

// Verify Email OTP
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ValidationError('Please provide email and OTP.');
  }

  const user = await User.findOne({ email }).select('+emailOtp +emailOtpExpiry');
  if (!user) {
    throw new NotFoundError('No user found with this email.');
  }

  if (!user.validateEmailOtp(otp)) {
    throw new ValidationError('Invalid or expired OTP. Please request a new OTP.');
  }

  user.isEmailVerified = true;
  user.emailOtp = undefined;
  user.emailOtpExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully.' });
});

// Resend Email OTP
export const resendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Please provide your email to resend the OTP.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('No user found with this email.');
  }

  const otp = user.setEmailOtp();
  await user.save();

  await EmailService.sendEmail({
    to: email,
    subject: 'Email Verification OTP',
    text: `Your new OTP is: ${otp}.`,
  });

  res.status(200).json({ message: 'A new OTP has been sent to your email.' });
});

// ================================
//    Password Reset
// ================================

// Request Password Reset
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Please provide your email to request a password reset.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('No user found with this email.');
  }

  const otp = user.setPasswordResetOtp();
  await user.save();

  await EmailService.sendEmail({
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}.`,
  });

  res.status(200).json({ message: 'An OTP for password reset has been sent to your email.' });
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ValidationError('Please provide email, OTP, and new password.');
  }

  const user = await User.findOne({ email }).select('+passwordResetOtp +passwordResetOtpExpiry');
  if (!user) {
    throw new NotFoundError('No user found with this email.');
  }

  if (!user.validatePasswordResetOtp(otp)) {
    throw new ValidationError('Invalid or expired OTP. Please request a new OTP.');
  }

  user.password = newPassword;
  user.passwordResetOtp = undefined;
  user.passwordResetOtpExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully.' });
});