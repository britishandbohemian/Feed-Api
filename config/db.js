import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/userModel.js'; // Adjust path to your User model

// Load environment variables from .env file
dotenv.config();

/**
 * Connect to MongoDB and optionally reset collections.
 * @param {boolean} resetCollections - If true, reset specific collections.
 */
const connectDB = async (resetCollections = false) => {
    try {
        // Establish connection to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,  // For compatibility with future versions
            useCreateIndex: true,     // Ensures indexes are created correctly
        });

        console.log('MongoDB connected successfully');

        // Optionally reset collections (only do this in non-production environments or with caution)
        if (resetCollections) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Resetting collections...');
                await User.collection.drop(); // Drop the User collection
                console.log('Collections reset successfully');
            } else {
                console.log('Skipping collection reset in production environment.');
            }
        }
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // Exit process with failure code
    }
};

export default connectDB;
