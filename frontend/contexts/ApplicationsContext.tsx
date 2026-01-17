'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Application } from '@/lib/types';
import api from '@/lib/api';

interface ApplicationsContextType {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  getApplicationsForBounty: (bountyId: string) => Promise<Application[]>;
  submitApplication: (jobId: string, coverLetter?: string) => Promise<Application>;
  getUserApplicationForBounty: (bountyId: string, userId: string) => Application | undefined;
  refreshMyApplications: () => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMyApplications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { applications: myApps } = await api.getMyApplications();
      setApplications(myApps.map((app: any) => ({
        ...app,
        bountyId: app.jobId,
        message: app.coverLetter || '',
        bidAmount: 0,
        bidCurrency: 'USD' as const,
      })));
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getApplicationsForBounty = useCallback(async (bountyId: string): Promise<Application[]> => {
    try {
      const { applications: apps } = await api.getApplicationsForJob(bountyId);
      return apps.map((app: any) => ({
        ...app,
        bountyId: app.jobId,
        message: app.coverLetter || '',
        bidAmount: 0,
        bidCurrency: 'USD' as const,
      }));
    } catch (err) {
      console.error('Failed to fetch applications for bounty:', err);
      return [];
    }
  }, []);

  const submitApplication = useCallback(async (jobId: string, coverLetter?: string): Promise<Application> => {
    setIsLoading(true);
    setError(null);
    try {
      const app = await api.submitApplication(jobId, coverLetter);
      const newApplication: Application = {
        ...app,
        bountyId: app.jobId,
        message: app.coverLetter || '',
        bidAmount: 0,
        bidCurrency: 'USD' as const,
      };
      setApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit application';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserApplicationForBounty = useCallback((bountyId: string, userId: string): Application | undefined => {
    return applications.find(
      (app) => (app.bountyId === bountyId || app.jobId === bountyId) && 
               (app.applicant?.id === userId || app.applicantId === userId)
    );
  }, [applications]);

  return (
    <ApplicationsContext.Provider
      value={{
        applications,
        isLoading,
        error,
        getApplicationsForBounty,
        submitApplication,
        getUserApplicationForBounty,
        refreshMyApplications,
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
