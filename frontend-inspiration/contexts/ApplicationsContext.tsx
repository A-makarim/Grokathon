'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Application } from '@/lib/types';
import { mockApplications } from '@/lib/mockData';

interface ApplicationsContextType {
  applications: Application[];
  getApplicationsForBounty: (bountyId: string) => Application[];
  submitApplication: (application: Omit<Application, 'id' | 'appliedAt' | 'status'>) => void;
  getUserApplicationForBounty: (bountyId: string, userId: string) => Application | undefined;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(mockApplications);

  const getApplicationsForBounty = (bountyId: string): Application[] => {
    return applications.filter((app) => app.bountyId === bountyId);
  };

  const submitApplication = (
    application: Omit<Application, 'id' | 'appliedAt' | 'status'>
  ) => {
    const newApplication: Application = {
      ...application,
      id: `app${Date.now()}`,
      appliedAt: new Date(),
      status: 'pending',
    };
    setApplications((prev) => [...prev, newApplication]);
  };

  const getUserApplicationForBounty = (
    bountyId: string,
    userId: string
  ): Application | undefined => {
    return applications.find(
      (app) => app.bountyId === bountyId && app.applicant.id === userId
    );
  };

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        getApplicationsForBounty,
        submitApplication,
        getUserApplicationForBounty,
      }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
}

export function useApplications() {
  const context = useContext(ApplicationsContext);
  if (context === undefined) {
    throw new Error('useApplications must be used within an ApplicationsProvider');
  }
  return context;
}
