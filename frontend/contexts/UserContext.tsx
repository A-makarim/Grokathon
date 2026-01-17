'use client';

import React, { createContext, useContext, useState } from 'react';
import type { User } from '@/lib/types';
import { getCurrentUser } from '@/lib/mockData';

interface UserContextType {
  currentUser: User;
  isBountyMaker: boolean;
  toggleRole: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser] = useState<User>(getCurrentUser());
  const [isBountyMaker, setIsBountyMaker] = useState(true);

  const toggleRole = () => {
    setIsBountyMaker((prev) => !prev);
  };

  return (
    <UserContext.Provider value={{ currentUser, isBountyMaker, toggleRole }}>
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
