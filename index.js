import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Import routes and middleware
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import passport from './config/passport.js';

// Initialize Express app
const app = express();

// Define PORT
const PORT = process.env.PORT || 5000;

// ====================
// Middleware Setup
// ====================

// Set security HTTP headers
app.use(helmet());

// Enable CORS (if needed)
app.use(cors());

// Body parsers (replacing body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser to parse cookies from requests
app.use(cookieParser());

// HTTP request logger (optional, useful for development)
app.use(morgan('dev'));

// Rate Limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use(limiter);

// ====================
// MongoDB Connection
// ====================

let cachedDb = null; // Cache the MongoDB connection

const connectDB = async () => {
  if (cachedDb) {
    console.log('Using cached MongoDB connection');
    return cachedDb;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    cachedDb = db; // Cache the connection
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit if database connection fails
  }
};

// ====================
// Routes
// ====================

// Mount user-related routes
app.use('/api/users', userRoutes);

// Mount task-related routes
app.use('/api/tasks', taskRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Hello, Vercel!');
});

// ====================
// Global Error Handler
// ====================

// This should be the last middleware
app.use(errorHandler);

// ====================
// Export for Vercel
// ====================

// Export the app as a serverless function
export default async (req, res) => {
  await connectDB(); // Connect to MongoDB before handling requests
  return app(req, res);
};