/**
 * API Client for xBounty Registry
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('xbounty_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('xbounty_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('xbounty_token');
    }
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    requiresAuth = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (requiresAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.statusText}`);
    }

    return data;
  }

  // ==========================================================================
  // AUTH
  // ==========================================================================

  async register(name: string, twitterHandle?: string) {
    const data = await this.request<{ user: any; token: string }>(
      'POST',
      '/users/register',
      { name, twitterHandle }
    );
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request<{ user: any }>('GET', '/users/me', undefined, true);
  }

  // ==========================================================================
  // JOBS
  // ==========================================================================

  async getOpenJobs(params?: { complexity?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams();
    if (params?.complexity) query.set('complexity', params.complexity);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    
    const queryStr = query.toString();
    return this.request<{ jobs: any[]; total: number }>(
      'GET',
      `/jobs/open${queryStr ? `?${queryStr}` : ''}`
    );
  }

  async getPendingJobs() {
    return this.request<{ jobs: any[]; total: number }>(
      'GET',
      '/jobs/pending',
      undefined,
      true
    );
  }

  async getJob(id: string) {
    return this.request<any>('GET', `/jobs/${id}`);
  }

  async approveJob(id: string, budget: number) {
    return this.request<any>('PATCH', `/jobs/${id}/approve`, { budget }, true);
  }

  async assignJob(id: string, assigneeId: string) {
    return this.request<any>('PATCH', `/jobs/${id}/assign`, { assigneeId }, true);
  }

  async completeJob(id: string) {
    return this.request<any>('PATCH', `/jobs/${id}/complete`, {}, true);
  }

  async cancelJob(id: string) {
    return this.request<any>('PATCH', `/jobs/${id}/cancel`, {}, true);
  }

  // ==========================================================================
  // APPLICANTS
  // ==========================================================================

  async getApplicant(id: string) {
    return this.request<{ applicant: any }>('GET', `/applicants/${id}`);
  }

  async getMyApplicantProfile() {
    return this.request<{ applicant: any }>('GET', '/applicants/me', undefined, true);
  }

  async createApplicantProfile(data: {
    name: string;
    email?: string;
    twitterHandle?: string;
    bio?: string;
    skills?: string[];
    portfolioUrl?: string;
  }) {
    return this.request<{ applicant: any }>('POST', '/applicants', data, true);
  }

  async updateApplicantProfile(data: Partial<{
    name: string;
    email: string;
    bio: string;
    skills: string[];
    portfolioUrl: string;
  }>) {
    return this.request<{ applicant: any }>('PATCH', '/applicants/me', data, true);
  }

  // ==========================================================================
  // APPLICATIONS
  // ==========================================================================

  async getApplicationsForJob(jobId: string) {
    return this.request<{ applications: any[]; total: number }>(
      'GET',
      `/applications/job/${jobId}`,
      undefined,
      true
    );
  }

  async getMyApplications() {
    return this.request<{ applications: any[]; total: number }>(
      'GET',
      '/applications/me',
      undefined,
      true
    );
  }

  async submitApplication(jobId: string, coverLetter?: string) {
    return this.request<any>(
      'POST',
      '/applications',
      { jobId, coverLetter },
      true
    );
  }

  async updateApplicationStatus(id: string, status: string) {
    return this.request<any>(
      'PATCH',
      `/applications/${id}/status`,
      { status },
      true
    );
  }

  // ==========================================================================
  // SUGGESTIONS
  // ==========================================================================

  async getSuggestionForJob(jobId: string) {
    return this.request<any>('GET', `/suggestions/job/${jobId}`, undefined, true);
  }

  async generateSuggestion(jobId: string) {
    return this.request<any>('POST', `/suggestions/generate/${jobId}`, {}, true);
  }

  // ==========================================================================
  // HEALTH & STATS
  // ==========================================================================

  async getHealth() {
    return this.request<{ status: string; timestamp: string }>('GET', '/health');
  }

  async getStats() {
    return this.request<any>('GET', '/stats');
  }
}

export const api = new ApiClient();
export default api;

