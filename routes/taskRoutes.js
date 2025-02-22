import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Protected Routes (Token Required)
// POST /tasks - Create a new task (requires authentication)
router.post('/', protect, createTask); // 🔒 Add `protect` middleware here

// GET /tasks - Get all tasks
router.get('/', protect, getTasks);

// GET /tasks/:id - Get a task by ID
router.get('/:id', protect, getTaskById);

// PUT /tasks/:id - Update a task by ID
router.put('/:id', protect, updateTask);

// DELETE /tasks/:id - Delete a task by ID
router.delete('/:id', protect, deleteTask);

export default router;