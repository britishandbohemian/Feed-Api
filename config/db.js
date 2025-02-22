import mongoose from 'mongoose';
import User from '../models/userModel.js'; // Import the User model
import Task from '../models/taskModel.js'; // Import the Task model

/**
 * Connect to MongoDB and optionally reset collections.
 * @param {boolean} resetCollections - If true, reset specific collections.
 */
const connectDB = async (resetCollections = false) => {
    try {
        // Hardcode your MongoDB connection URI
        const MONGO_URI =
            'mongodb+srv://kamogelomosia:eightmillionby30@feed.jkbxs.mongodb.net/?retryWrites=true&w=majority&appName=Feed';

        // Establish connection to MongoDB
        await mongoose.connect(MONGO_URI);

        console.log('MongoDB connected successfully');

        // Optionally reset collections (only do this in non-production environments or with caution)
        if (resetCollections) {
            console.log('Resetting collections...');

            // Drop the User collection if it exists
            if (mongoose.connection.collections['users']) {
                await mongoose.connection.collections['users'].drop();
                console.log('Users collection dropped');
            }

            // Drop the Task collection if it exists
            if (mongoose.connection.collections['tasks']) {
                await mongoose.connection.collections['tasks'].drop();
                console.log('Tasks collection dropped');
            }

            console.log('Collections reset successfully');
        }
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // Exit process with failure code
    }
};

export default connectDB;