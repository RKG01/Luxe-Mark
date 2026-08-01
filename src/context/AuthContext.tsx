import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to map roles based on email since backend doesn't return it
  const getMappedRoles = (email: string): string[] => {
    const lowerEmail = email.toLowerCase();
    if (
      lowerEmail === 'admin@example.com' ||
      lowerEmail.startsWith('admin') ||
      lowerEmail === 'ryuk@example.com' ||
      lowerEmail.startsWith('ryuk')
    ) {
      return ['ROLE_ADMIN', 'ROLE_CUSTOMER'];
    }
    return ['ROLE_CUSTOMER'];
  };

  useEffect(() => {
    // Load session from local storage on mount
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        // Reinforce roles mapping in case it got cleared or was missing
        if (!parsedUser.roles || parsedUser.roles.length === 0) {
          parsedUser.roles = getMappedRoles(parsedUser.email);
        }
        setToken(savedToken);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const roles = getMappedRoles(response.email);
      const userObj: User = {
        userId: response.userId,
        username: response.username,
        email: response.email,
        roles: roles,
      };

      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(userObj));
      
      setToken(response.accessToken);
      setUser(userObj);
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Backend register returns empty token, so user must log in after registering
      await authService.register(username, email, password);
      // Automatically call login after successful registration to get JWT
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
