// middleware/errorHandler.js
import { ValidationError, NotFoundError } from '../utils/customErrors.js';

const errorHandler = (err, req, res, next) => {
  console.error(err); // Log error details for debugging (consider using a logging library)

  // Handle specific known errors
  if (err instanceof ValidationError) {
    return res.status(400).json({ message: err.message });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({ message: err.message });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Handle duplicate key errors (e.g., unique fields)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue);
    return res.status(400).json({ message: `Duplicate field value: ${field}. Please use another value!` });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token has expired.' });
  }

  // Default to 500 server error for unhandled cases
  res.status(500).json({ message: 'Internal Server Error.' });
};

export default errorHandler;
