'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Application } from '@/lib/types';
import api from '@/lib/api';

interface ApplicationsContextType {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  loadingByJob: Record<string, boolean>;
  applicationsByJob: Record<string, Application[]>;
  getApplicationsForBounty: (bountyId: string) => Application[];
  fetchApplicationsForJob: (bountyId: string) => Promise<Application[]>;
  submitApplication: (jobId: string, coverLetter?: string, bidAmount?: number) => Promise<Application>;
  getUserApplicationForBounty: (bountyId: string, userId: string) => Application | undefined;
  refreshMyApplications: () => Promise<void>;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

export function ApplicationsProvider({ children }: { children: React.ReactNode }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsByJob, setApplicationsByJob] = useState<Record<string, Application[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingByJob, setLoadingByJob] = useState<Record<string, boolean>>({});
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

  // Synchronous getter for cached applications
  const getApplicationsForBounty = useCallback((bountyId: string): Application[] => {
    return applicationsByJob[bountyId] || [];
  }, [applicationsByJob]);

  // Async fetch that updates the cache
  const fetchApplicationsForJob = useCallback(async (bountyId: string): Promise<Application[]> => {
    setLoadingByJob(prev => ({ ...prev, [bountyId]: true }));
    try {
      const { applications: apps } = await api.getApplicationsForJob(bountyId);
      const mappedApps = apps.map((app: any) => ({
        ...app,
        bountyId: app.jobId,
        message: app.coverLetter || '',
        bidAmount: 0,
        bidCurrency: 'USD' as const,
      }));
      setApplicationsByJob(prev => ({ ...prev, [bountyId]: mappedApps }));
      return mappedApps;
    } catch (err) {
      console.error('Failed to fetch applications for bounty:', err);
      return [];
    } finally {
      setLoadingByJob(prev => ({ ...prev, [bountyId]: false }));
    }
  }, []);

  const submitApplication = useCallback(async (jobId: string, coverLetter?: string, bidAmount?: number): Promise<Application> => {
    setIsLoading(true);
    setError(null);
    try {
      const app = await api.submitApplication(jobId, coverLetter, bidAmount);
      const newApplication: Application = {
        ...app,
        bountyId: app.jobId,
        message: app.coverLetter || '',
        bidAmount: bidAmount || app.bidAmount || 0,
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
        loadingByJob,
        applicationsByJob,
        getApplicationsForBounty,
        fetchApplicationsForJob,
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
