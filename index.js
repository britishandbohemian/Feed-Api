import express from 'express'; // Import Express
import 'dotenv/config'; // Load environment variables
import connectDB from './config/db.js'; // Import DB connection
import userRoutes from './routes/userRoutes.js'; // Import user routes
import taskRoutes from './routes/taskRoutes.js'; // Import task routes
import cors from 'cors'; // Import CORS package

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000; // Use environment variable for port

// ✅ Middleware: Allow large request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Enable CORS for frontend communication


app.use(cors({
  origin: 'https://cuddly-orbit-75g574g74jcx49w-3000.app.github.dev/', // Replace with your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Connect to MongoDB
connectDB(); // Call this without `true` unless you want to reset data

// ✅ Define API routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// ✅ Test route
app.get('/', (req, res) => res.send('Hello, World!'));

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); 
