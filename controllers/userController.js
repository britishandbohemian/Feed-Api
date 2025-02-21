import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import emailService from '../utils/EmailService.js';

// ✅ Function to generate a JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ✅ 1. User Registration (Signup) - NOW RETURNS TOKEN ✅
export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const otp = user.setEmailOtp();
    await user.save();
    await emailService.sendOtpEmail(user.email, otp);

    const token = generateToken(user._id); // Generate token after signup

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for OTP.',
      token, // Send token to frontend
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Signup failed', error: error.message });
  }
};

// ✅ 2. OTP Verification - FIXED TOKEN RESPONSE ✅
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+emailOtp +emailOtpExpiry');

    if (!user || !user.validateEmailOtp(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id); // Generate token after OTP verification

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token, // Send token to frontend
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
};
// ✅ 3. Resend OTP (No token needed)
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with this email' });
    }

    const otp = user.setEmailOtp();
    await user.save();
    await emailService.sendOtpEmail(user.email, otp);

    res.status(200).json({ success: true, message: 'OTP sent to email', expiresIn: 10 });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
};

// ✅ 4. User Login - NOW RETURNS TOKEN ✅
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ success: false, message: 'Email not verified' });
    }

    const token = generateToken(user._id); // Generate token after login

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token, // Send token to frontend
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login error', error: error.message });
  }
};

// ✅ 5. Logout
export const logoutUser = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'You have been logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Logout failed', error: error.message });
  }
};

// ✅ 6. Get All Users (Protected)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, message: 'Users retrieved successfully.', data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving users', error: error.message });
  }
};

// ✅ 7. Get User by ID (Protected)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User retrieved', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving user', error: error.message });
  }
};

// ✅ 8. Update User (Protected)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// ✅ 9. Delete User (Protected)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};
