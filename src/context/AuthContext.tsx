import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { authenticateMockUser, mockAuthAccounts } from '../data/mockAuth';

export interface RegisterPayload {
  name: string;
  rollNumber: string;
  department: string;
  cgpa: number;
  email: string;
  password?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  loginAsMockRole: (role: UserRole) => void;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Start with default STUDENT logged in or null (let's default to null so user can experience Login flow, or easily login)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    // Simulate slight network delay
    await new Promise((res) => setTimeout(res, 250));

    const authResult = authenticateMockUser(email, password);
    setIsLoading(false);

    if (authResult.success && authResult.user) {
      setCurrentUser(authResult.user);
      return { success: true };
    }

    return {
      success: false,
      message: authResult.message || 'Invalid credentials',
    };
  };

  const loginAsMockRole = (role: UserRole) => {
    const account = mockAuthAccounts.find((a) => a.user.role === role);
    if (account) {
      setCurrentUser(account.user);
    }
  };

  const register = async (
    payload: RegisterPayload
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 300));

    const newStudentUser: AuthUser = {
      id: `STU-${Date.now().toString().slice(-5)}`,
      email: payload.email,
      name: payload.name,
      role: 'STUDENT',
      rollNumber: payload.rollNumber,
      department: payload.department,
      cgpa: payload.cgpa,
      phone: '+91 98765 00000',
    };

    setCurrentUser(newStudentUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        login,
        loginAsMockRole,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
