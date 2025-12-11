import { browser } from '$app/environment';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/api/v1';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

async function api<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Types for Project
export type Project = {
  id: string;
  name: string;
  description: string | null;
  prompt: string;
  status: string;
  platforms: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  prompt: string;
  platforms: string[];
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

// Project API functions
export const projectsApi = {
  list: (token: string) =>
    api<{ projects: Project[] }>('/projects', { token }),

  get: (id: string, token: string) =>
    api<{ project: Project }>(`/projects/${id}`, { token }),

  create: (data: CreateProjectInput, token: string) =>
    api<{ project: Project }>('/projects', { method: 'POST', body: data, token }),

  update: (id: string, data: UpdateProjectInput, token: string) =>
    api<{ project: Project }>(`/projects/${id}`, { method: 'PATCH', body: data, token }),

  delete: (id: string, token: string) =>
    api<{ deleted: boolean }>(`/projects/${id}`, { method: 'DELETE', token }),
};
