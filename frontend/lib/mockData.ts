/**
 * Mock data for development (fallback when API is unavailable)
 */

import type { User, Bounty, Application } from './types';

// Default admin user
export const adminUser: User = {
  id: 'admin-1',
  name: 'xBounty Admin',
  role: 'admin',
  twitterHandle: 'xbounty',
  avatar: 'https://pbs.twimg.com/profile_images/1445134083019685890/f-v0-6Vb_400x400.png',
  createdAt: new Date().toISOString(),
};

// Default regular user
export const defaultUser: User = {
  id: 'user-1',
  name: 'Test User',
  role: 'user',
  twitterHandle: 'testuser',
  createdAt: new Date().toISOString(),
};

let currentUser: User = defaultUser;

export function getCurrentUser(): User {
  return currentUser;
}

export function setCurrentUser(user: User) {
  currentUser = user;
}

export function switchToAdmin() {
  currentUser = adminUser;
}

export function switchToUser() {
  currentUser = defaultUser;
}

// Mock bounties (empty by default - will be populated from API)
export const mockBounties: Bounty[] = [];

// Mock applications (empty by default - will be populated from API)
export const mockApplications: Application[] = [];

