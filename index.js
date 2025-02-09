import express from 'express';
import connectDB from './config/db.js'; // Adjust path to your connectDB file
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Initialize Express
const app = express();
const PORT = 5000;

// Middlewareb
app.use(express.json());

// Connect to MongoDB
connectDB(); // Call without resetting collections
// connectDB(true); // Call to reset collections (use with caution)

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('Hello, World!'));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));