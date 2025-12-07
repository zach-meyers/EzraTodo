import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '@/services/api';
import { User, JwtPayload, AuthContextValue } from '@/types';

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // check if token already exists
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const jwt = jwtDecode<JwtPayload>(token);
        // check if token is expired
        if (jwt.exp * 1000 > Date.now()) {
          setUser({
            id: jwt.sub,
            email: jwt.email,
            token,
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string): Promise<void> => {
    const data = await authAPI.signup(email, password);
    localStorage.setItem('token', data.token);
    const decoded = jwtDecode<JwtPayload>(data.token);
    setUser({
      id: decoded.sub,
      email: data.email,
      token: data.token,
    });
  };

  const login = async (email: string, password: string): Promise<void> => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('token', data.token);
    const decoded = jwtDecode<JwtPayload>(data.token);
    setUser({
      id: decoded.sub,
      email: data.email,
      token: data.token,
    });
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
