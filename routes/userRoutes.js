import express from 'express';
import {
    createUser,
    verifyEmailOtp,
    sendEmailOtp,
    loginUser,
    logoutUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Public Routes (No Token Required)
router.post('/register', createUser);  // 🔓 Open for everyone
router.post('/verify-otp', verifyEmailOtp);  // 🔓 Open for everyone
router.post('/send-otp', sendEmailOtp);  // 🔓 Open for everyone
router.post('/login', loginUser);  // 🔓 Open for everyone

// ✅ Protected Routes (Token Required)
router.post('/logout', protect, logoutUser);
router.get('/', protect, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

export default router;
