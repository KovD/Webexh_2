import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) return <Navigate to="/login" replace />;
  
  try {
    const decoded = jwtDecode(token);
    return decoded.admin ? children : <Navigate to="/login" replace />;
  } catch (error) {
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;