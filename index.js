import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables FIRST (before other imports)
dotenv.config({ path: './.env' }); // Explicit path for .env file

// Other imports
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ====================
// Middleware (simplified)
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================
// MongoDB Connection (optimized)
// ====================
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return; // Already connected
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// ====================
// Routes
// ====================
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('Hello, Vercel!'));

// ====================
// Server Setup
// ====================
export default async (req, res) => {
  await connectDB(); // Connect on every serverless request
  return app(req, res);
};

// Local development server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Local server on port ${PORT}`));
}