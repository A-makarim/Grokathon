'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';
import api from '@/lib/api';

interface UserContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (name: string, twitterHandle?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = currentUser?.role === 'admin';
  const isAuthenticated = !!currentUser;

  // Try to restore session on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await api.getMe();
      setCurrentUser({
        id: user.id,
        name: user.name,
        role: user.role,
        twitterHandle: user.twitterHandle,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
      });
    } catch (error) {
      console.error('Failed to refresh user:', error);
      api.clearToken();
      setCurrentUser(null);
    }
  }, []);

  const login = async (name: string, twitterHandle?: string) => {
    setIsLoading(true);
    try {
      const { user } = await api.register(name, twitterHandle);
      setCurrentUser({
        id: user.id,
        name: user.name,
        role: user.role,
        twitterHandle: user.twitterHandle,
        createdAt: user.createdAt,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
