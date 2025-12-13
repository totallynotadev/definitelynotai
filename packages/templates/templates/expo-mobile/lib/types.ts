// @agent:inject:types

// Example type (agent will replace with actual types)
export interface Item {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
