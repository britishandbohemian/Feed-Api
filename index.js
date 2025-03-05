import express from 'express';
import 'dotenv/config';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API is healthy' });
});

// Connect to MongoDB
connectDB();

// Define API routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => res.send('Hello, World!'));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));