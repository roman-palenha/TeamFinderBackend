import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const isAuthenticated = !!token;
  
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.id && parsedUser.userId) {
          parsedUser.id = parsedUser.userId;
        }
        setCurrentUser(parsedUser);
        
        console.log("Loaded user from localStorage:", parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);
  
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5136/api/users/register', userData);
      const { token: authToken, user } = response.data;
      
      if (!user.id && user.userId) {
        user.id = user.userId;
      }
      
      console.log("Registered user:", user);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(authToken);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data?.message || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };
  
  const login = async (credentials) => {
    try {
      const response = await axios.post('http://localhost:5136/api/users/login', credentials);
      const { token: authToken, user } = response.data;
      
      if (!user.id && user.userId) {
        user.id = user.userId;
      }
      
      console.log("Logged in user:", user);
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      setToken(authToken);
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password.'
      };
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };
  
  const updateProfile = async (userData) => {
    try {
      if (!currentUser || !currentUser.id) {
        throw new Error("User not properly authenticated. Please log in again.");
      }
      
      const response = await axios.put(`http://localhost:5136/api/users/${currentUser.id}`, userData);
      const updatedUser = response.data;
      
      if (!updatedUser.id && updatedUser.userId) {
        updatedUser.id = updatedUser.userId;
      }
      
      console.log("Updated user:", updatedUser);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error.response?.data?.message || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile. Please try again.'
      };
    }
  };
  
  const value = {
    currentUser,
    token,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}