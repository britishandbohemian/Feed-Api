import express from 'express';
import * as taskController from '../controllers/taskController.js';

const router = express.Router();

// Define routes
router.route('/')
    .post(taskController.createTask)
    .get(taskController.getAllTasks);

router.route('/:id')
    .get(taskController.getTask)
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

router.get('/overdue', taskController.getOverdueTasks);

export default router;
