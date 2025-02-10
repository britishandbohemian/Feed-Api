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

// Public routes
router.post('/', createUser);
router.post('/verify-otp', verifyEmailOtp);
router.post('/send-otp', sendEmailOtp);
router.post('/login', loginUser);

// Protected routes
router.use(protect);
router.post('/logout', logoutUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;