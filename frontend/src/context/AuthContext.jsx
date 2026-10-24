import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    console.log("AuthContext: Initializing state...");
    console.log("AuthContext: Token exists?", !!token);
    console.log("AuthContext: SavedUser exists?", !!savedUser);

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("AuthContext: Restoring session for:", parsedUser?.email);
        setUser(parsedUser);
      } catch (err) {
        console.error("AuthContext: Failed to parse saved user", err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      if (!token && savedUser) console.warn("AuthContext: User data present but TOKEN MISSING!");
      if (token && !savedUser) console.warn("AuthContext: Token present but USER DATA MISSING!");
      console.log("AuthContext: No valid session found in localStorage");
      setUser(null); // Explicitly ensure null
    }
    setLoading(false);
    console.log("AuthContext: Initialization complete. Loading:", false);

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        console.warn(`AuthContext: External storage change detected for key "${e.key}". New value:`, !!e.newValue);
        if (!e.newValue) {
           console.error("AuthContext: SESSION DATA WAS REMOVED FROM EXTERNAL SOURCE!");
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, refreshToken, id, name, email: userEmail, role } = response.data;
      
      const userData = { id, name, email: userEmail, role };
      console.log("AuthContext: Login successful. Saving session for:", userEmail);
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('refreshToken'); // Prevent stale/undefined token
      }
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, phone, password });
      const { token, refreshToken, id, name: userName, email: userEmail, role } = response.data;
      
      const userData = { id, name: userName, email: userEmail, role };
      console.log("AuthContext: Registration successful. Saving session for:", userEmail);
      
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };


  const logout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Clear application state to prevent cross-account data leaks
    localStorage.removeItem('allBookings');
    localStorage.removeItem('latestBooking');
    localStorage.removeItem('dashboardFormState');
    localStorage.removeItem('refund_requests');
    
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
