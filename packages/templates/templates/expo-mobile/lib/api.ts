const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787/api';

// @agent:inject:api-types

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.status}`);
  }

  return response.json();
}

export async function get<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'GET' });
}

export async function post<T>(endpoint: string, data: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function put<T>(endpoint: string, data: unknown): Promise<T> {
  return fetchApi<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function del<T>(endpoint: string): Promise<T> {
  return fetchApi<T>(endpoint, { method: 'DELETE' });
}

// @agent:inject:api-functions
