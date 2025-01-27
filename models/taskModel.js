// models/Task.js
import mongoose from 'mongoose';

/**
 * Step Schema for individual steps in a task
 */
const stepSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Step title is required'],
            trim: true,
            minlength: [1, 'Step title cannot be empty'],
        },
        deadline: {
            type: String, // Consider using Date type for actual deadlines
            trim: true,
            default: '',
        },
        mandatory: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false } // Prevent creation of _id for each step
);

/**
 * Task Schema
 */
const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task must have a title'],
            trim: true,
            minlength: [1, 'Task title cannot be empty'],
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        dueDate: {
            type: Date,
            default: null,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        steps: {
            type: [stepSchema],
            default: [],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Task must have an owner'],
        },
    },
    { timestamps: true }
);

/**
 * Static Method: Find tasks by owner
 * @param {ObjectId} ownerId
 * @returns {Promise<Task[]>}
 */
taskSchema.statics.findByOwner = function (ownerId) {
    return this.find({ owner: ownerId });
};

/**
 * Instance Method: Mark task as completed
 */
taskSchema.methods.markAsCompleted = function () {
    this.completed = true;
    return this.save();
};

/**
 * Model Export
 */
const Task = mongoose.model('Task', taskSchema);

export default Task;
