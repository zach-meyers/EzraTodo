import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

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
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.sub,
            email: decoded.email,
            token,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    const decoded = jwtDecode(data.token);
    setUser({
      id: decoded.sub,
      email: data.email,
      token: data.token,
    });
    return data;
  };

  const signup = async (email, password) => {
    const data = await authAPI.signup(email, password);
    localStorage.setItem('token', data.token);
    const decoded = jwtDecode(data.token);
    setUser({
      id: decoded.sub,
      email: data.email,
      token: data.token,
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
