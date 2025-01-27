import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext); // Assuming the UserContext holds the current user's state

  if (!user) {
    // If the user is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child component
  return children;
};

export default ProtectedRoute;
