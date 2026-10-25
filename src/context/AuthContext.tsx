import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { axiosClient, getApiErrorMessage } from '../api/axiosClient';
import { AuthUser, Department } from '../types';

export interface RegisterPayload {
  name: string;
  rollNumber: string;
  department: Department;
  cgpa: number;
  email: string;
  password?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = await AsyncStorage.getItem('ccpd_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axiosClient.get<{ user: AuthUser }>('/users/me');
        setCurrentUser(response.data.user);
      } catch {
        await AsyncStorage.removeItem('ccpd_token');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post<{ token: string; user: AuthUser }>('/auth/login', { email, password });
      await AsyncStorage.setItem('ccpd_token', response.data.token);
      setCurrentUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post<{ token: string; user: AuthUser }>('/auth/register', payload);
      await AsyncStorage.setItem('ccpd_token', response.data.token);
      setCurrentUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: getApiErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    void AsyncStorage.removeItem('ccpd_token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
