import mongoose from 'mongoose';
import User from '../models/userModel.js'; // Adjust path to your User model

/**
 * Connect to MongoDB and optionally reset collections.
 * @param {boolean} resetCollections - If true, reset specific collections.
 */
const connectDB = async (resetCollections = false) => {
    try {
        // Hardcode your MongoDB connection URI
        const MONGO_URI = "mongodb+srv://Kamogelo:112233445566@feed.sktqa.mongodb.net/?retryWrites=true&w=majority&appName=Feed";

        // Establish connection to MongoDB
        await mongoose.connect(MONGO_URI);

        console.log('MongoDB connected successfully');

        // Optionally reset collections (only do this in non-production environments or with caution)
        if (resetCollections) {
            console.log('Resetting collections...');
            await User.collection.drop(); // Drop the User collection
            console.log('Collections reset successfully');
        }
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // Exit process with failure code
    }
};

export default connectDB;