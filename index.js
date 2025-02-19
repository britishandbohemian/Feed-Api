import express from 'express'; // Import the Express library
import 'dotenv/config'; // Load environment variables from .env file
import connectDB from './config/db.js'; // Import the database connection function
import userRoutes from './routes/userRoutes.js'; // Import user routes
import taskRoutes from './routes/taskRoutes.js'; // Import task routes
import cors from 'cors'; // Import the cors package


// Initialize Express
const app = express(); // Create an instance of Express
const PORT = 5000; // Define the port number for the server

// Middleware
app.use(express.json()); // Use middleware to parse JSON request bodies


// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true, // Allow cookies and credentials
  }));

// Connect to MongoDB
connectDB(true); // Call the function to connect to MongoDB without resetting collections
// connectDB(true); // Uncomment to reset collections (use with caution)

// Routes
app.use('/api/users', userRoutes); // Define route for user-related requests
app.use('/api/tasks', taskRoutes); // Define route for task-related requests

app.get('/', (req, res) => res.send('Hello, World!')); // Define a route for the root URL

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server and log the port number