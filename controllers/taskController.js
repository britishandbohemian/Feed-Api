import Task from '../models/taskModel.js';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Create task with authenticated user as owner
    const task = await Task.create({
      title,
      description,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Task created successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: error.message });
  }
};

// Get all tasks
// Example controller structure that should work with your routes
export const getTasks = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user._id;

    // Fetch tasks for logged-in user
    const tasks = await Task.find({ user: userId });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('owner');
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task retrieved successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve task', error: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate input
    if (!title && !description) {
      return res.status(400).json({ success: false, message: 'At least one field (title or description) is required to update the task' });
    }

    // Create an update object with only allowed fields
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    // Find and update the task
    const task = await Task.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({ success: true, message: 'Task updated successfully', data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: error.message });
  }
};