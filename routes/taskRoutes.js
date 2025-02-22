import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

// Protect all task routes with authentication middleware
router.use(protect);

// POST /tasks - Create a new task
// This route is used to create a new task. The request body should contain the task details.
router.post('/', createTask);

// GET /tasks - Get all tasks
// This route is used to fetch a list of all tasks associated with the authenticated user.
router.get('/', getTasks);

// GET /tasks/:id - Get a task by ID
// This route is used to fetch a specific task by its unique identifier (ID).
router.get('/:id', getTaskById);

// PUT /tasks/:id - Update a task by ID
// This route is used to update an existing task. The request body should contain the updated task details.
router.put('/:id', updateTask);

// DELETE /tasks/:id - Delete a task by ID
// This route is used to delete a specific task by its unique identifier (ID).
router.delete('/:id', deleteTask);

export default router;