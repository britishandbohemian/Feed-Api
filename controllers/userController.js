import User from '../models/userModel.js'; // Import User model for database operations
import jwt from 'jsonwebtoken'; // Import JSON Web Token for authentication
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import emailService from '../utils/EmailService.js'; // Import email service for sending OTPs

// 1. User Registration with OTP Generation
export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields: username, email, and password.' });
    }

    // Create a new user
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Generate and send OTP
    const otp = user.setEmailOtp();
    await user.save();
    await emailService.sendOtpEmail(user.email, otp);

    // Sanitize user data before sending response
    const sanitizedUser = user.toObject();
    ['password', 'emailOtp', 'emailOtpExpiry'].forEach(field => delete sanitizedUser[field]);

    // Respond with success message
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email for the verification OTP.',
      data: sanitizedUser,
    });
  } catch (error) {
    // Handle duplicate user error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400).json({ success: false, message: `The provided ${field} already exists. Please use a different one.` });
    } else {
      // Handle other errors
      res.status(500).json({ success: false, message: 'An error occurred while creating the user. Please try again later.', error: error.message });
    }
  }
};

// 2. OTP Verification
// In verifyEmailOtp controller
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Normalize and validate input
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail || !otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid email and 6-digit OTP are required'
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email: normalizedEmail })
      .select('+emailOtp +emailOtpExpiry');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Validate OTP
    if (!user.validateEmailOtp(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update user status
    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });

    // Prepare response data
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      isEmailVerified: user.isEmailVerified
    };

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: userData
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// 3. Resend OTP
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check for required fields
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required to resend the OTP.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with the provided email.' });
    }

    // Generate and send new OTP
    const otp = user.setEmailOtp();
    await user.save();
    await emailService.sendOtpEmail(user.email, otp);

    // Respond with success message
    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your registered email address.',
      expiresIn: process.env.OTP_EXPIRATION_MINUTES || 10,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred while sending the OTP. Please try again later.', error: error.message });
  }
};

// 4. User Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required for login.' });
    }

    // Find user by email and include password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password. Please try again.' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your email is not verified. Please check your inbox for the verification OTP or request a new one.',
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

    // Sanitize user data before sending response
    const sanitizedUser = user.toObject();
    ['password', 'emailOtp', 'emailOtpExpiry'].forEach(field => delete sanitizedUser[field]);

    // Respond with success message and token
    res.status(200).json({ success: true, message: 'Login successful. Welcome back!', data: { ...sanitizedUser, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'An error occurred during login. Please try again later.', error: error.message });
  }
};

// 5. User Logout
export const logoutUser = async (req, res) => {
  try {
    // Respond with success message
    res.status(200).json({ success: true, message: 'You have been logged out successfully.' });
  } catch (error) {
    // Handle errors during logout
    res.status(500).json({ success: false, message: 'An error occurred during logout. Please try again later.', error: error.message });
  }
};

// Additional User Management Functions
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users
    // Respond with success message and user data
    res.status(200).json({ success: true, message: 'Users retrieved successfully.', data: users });
  } catch (error) {
    // Handle errors while retrieving users
    res.status(500).json({ success: false, message: 'An error occurred while retrieving users. Please try again later.', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // Find user by ID
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with the provided ID.' });
    }
    // Respond with success message and user data
    res.status(200).json({ success: true, message: 'User retrieved successfully.', data: user });
  } catch (error) {
    // Handle errors while retrieving user
    res.status(500).json({ success: false, message: 'An error occurred while retrieving the user. Please try again later.', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Update user by ID
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with the provided ID to update.' });
    }
    // Respond with success message and updated user data
    res.status(200).json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    // Handle errors while updating user
    res.status(500).json({ success: false, message: 'An error occurred while updating the user. Please try again later.', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); // Delete user by ID
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with the provided ID to delete.' });
    }
    // Respond with success message
    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    // Handle errors while deleting user
    res.status(500).json({ success: false, message: 'An error occurred while deleting the user. Please try again later.', error: error.message });
  }
};