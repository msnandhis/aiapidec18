const API_BASE_URL = '/backend/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    total_pages: number;
    current_page: number;
    per_page: number;
  };
}

export interface Resource {
  id: number;
  name: string;
  description: string;
  url: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface Submission {
  id: number;
  name: string;
  description: string;
  url: string;
  category_id: number;
  submitter_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface DashboardStats {
  total_resources: number;
  total_categories: number;
  total_submissions: number;
  total_messages: number;
  recent_submissions: Submission[];
  recent_messages: Message[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

// Resources
export async function fetchResources(category?: string, page: number = 1): Promise<ApiResponse<Resource[]>> {
  const url = new URL(`${API_BASE_URL}/resources.php`);
  if (category) url.searchParams.append('category', category);
  url.searchParams.append('page', page.toString());
  
  const response = await fetch(url.toString());
  return handleResponse<ApiResponse<Resource[]>>(response);
}

export async function createResource(data: Partial<Resource>): Promise<ApiResponse<Resource>> {
  const response = await fetch(`${API_BASE_URL}/resources.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Resource>>(response);
}

export async function updateResource(id: number, data: Partial<Resource>): Promise<ApiResponse<Resource>> {
  const response = await fetch(`${API_BASE_URL}/resources.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Resource>>(response);
}

export async function deleteResource(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/resources.php?id=${id}`, {
    method: 'DELETE',
  });
  return handleResponse<ApiResponse<null>>(response);
}

// Categories
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  const response = await fetch(`${API_BASE_URL}/categories.php`);
  return handleResponse<ApiResponse<Category[]>>(response);
}

export async function createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
  const response = await fetch(`${API_BASE_URL}/categories.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Category>>(response);
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<ApiResponse<Category>> {
  const response = await fetch(`${API_BASE_URL}/categories.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Category>>(response);
}

export async function deleteCategory(id: number): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/categories.php?id=${id}`, {
    method: 'DELETE',
  });
  return handleResponse<ApiResponse<null>>(response);
}

// Submissions
export async function fetchSubmissions(status?: string, page: number = 1): Promise<ApiResponse<Submission[]>> {
  const url = new URL(`${API_BASE_URL}/submissions.php`);
  if (status) url.searchParams.append('status', status);
  url.searchParams.append('page', page.toString());
  
  const response = await fetch(url.toString());
  return handleResponse<ApiResponse<Submission[]>>(response);
}

export async function submitApiKit(data: {
  name: string;
  email: string;
  tool_name: string;
  description: string;
  api_link: string;
}): Promise<ApiResponse<Submission>> {
  const response = await fetch(`${API_BASE_URL}/submissions.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Submission>>(response);
}

export async function updateSubmissionStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<ApiResponse<Submission>> {
  const response = await fetch(`${API_BASE_URL}/submissions.php?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes: notes }),
  });
  return handleResponse<ApiResponse<Submission>>(response);
}

export async function deleteSubmission(id: string): Promise<ApiResponse<null>> {
  const response = await fetch(`${API_BASE_URL}/submissions.php?id=${id}`, {
    method: 'DELETE',
  });
  return handleResponse<ApiResponse<null>>(response);
}

// Messages
export async function fetchMessages(): Promise<ApiResponse<Message[]>> {
  const response = await fetch(`${API_BASE_URL}/messages.php`);
  return handleResponse<ApiResponse<Message[]>>(response);
}

export async function submitContactForm(data: { name: string; email: string; message: string }): Promise<ApiResponse<Message>> {
  const response = await fetch(`${API_BASE_URL}/messages.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ApiResponse<Message>>(response);
}

// Dashboard
export async function fetchDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const response = await fetch(`${API_BASE_URL}/dashboard.php`);
  return handleResponse<ApiResponse<DashboardStats>>(response);
}

// View Tracking
export async function trackView(type: 'resource' | 'category', id: string | number): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/stats.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
}
