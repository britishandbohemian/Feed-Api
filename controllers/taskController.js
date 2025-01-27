import Task from '../models/taskModel.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Create Task
 * Includes handling of steps.
 */
export const createTask = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id']; // Expect userId in the request headers
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'User ID is required in headers.' });
  }

  const { title, description, dueDate, steps } = req.body;

  // Validate steps if provided
  if (steps && !Array.isArray(steps)) {
    return res.status(400).json({ status: 'fail', message: 'Steps must be an array.' });
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    steps,
    owner: userId,
  });

  res.status(201).json({ status: 'success', data: { task } });
});

/**
 * Get All Tasks
 * Fetch tasks belonging to the provided user ID.
 */
export const getAllTasks = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'User ID is required in headers.' });
  }

  const tasks = await Task.find({ owner: userId });
  res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
});

/**
 * Get Single Task
 * Fetch a specific task by ID for the provided user.
 */
export const getTask = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'User ID is required in headers.' });
  }

  const task = await Task.findOne({ _id: req.params.id, owner: userId });
  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found.' });
  }

  res.status(200).json({ status: 'success', data: { task } });
});

/**
 * Update Task
 * Update task details, including steps.
 */
export const updateTask = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'User ID is required in headers.' });
  }

  const { title, description, dueDate, steps, completed } = req.body;

  const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { title, description, dueDate, steps, completed },
      { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found or unauthorized.' });
  }

  res.status(200).json({ status: 'success', data: { task } });
});

/**
 * Delete Task
 * Soft-delete a task for the provided user.
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'User ID is required in headers.' });
  }

  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: userId });
  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found or unauthorized.' });
  }

  res.status(200).json({ status: 'success', data: null });
});

/**
 * Get Overdue Tasks
 * Fetch overdue tasks for the provided user.
 */
export const getOverdueTasks = asyncHandler(async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ status: 'fail', message: 'User ID is required in headers.' });
  }

  const now = new Date();
  const tasks = await Task.find({
    owner: userId,
    dueDate: { $lt: now },
    completed: false,
  });

  res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
});
