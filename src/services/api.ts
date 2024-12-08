const API_BASE_URL = '/backend/api';

// Helper function to build API URLs
function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(window.location.origin + API_BASE_URL + '/' + endpoint);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }
  
  const data = await response.json();
  return data as ApiResponse<T>;
}

// Dashboard
export interface DashboardStats {
  total_resources: number;
  total_categories: number;
  total_submissions: number;
  pending_submissions: number;
  total_messages: number;
  unread_messages: number;
  recent_submissions: Array<{
    id: string;
    tool_name: string;
    name: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  }>;
  recent_messages: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    created_at: string;
  }>;
  recent_resources: Array<{
    id: string;
    name: string;
    category_name: string;
    views: number;
    created_at: string;
  }>;
  category_distribution: Array<{
    label: string;
    count: number;
  }>;
  submission_status: Array<{
    status: string;
    count: number;
  }>;
  message_status: Array<{
    status: string;
    count: number;
  }>;
  recent_activity: Array<{
    type: 'submission' | 'message' | 'resource';
    id: string;
    title: string;
    status?: string;
    category?: string;
    timestamp: string;
  }>;
  daily_resources: Array<{
    date: string;
    count: number;
  }>;
}

export async function fetchDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  const url = buildUrl('dashboard.php');
  const response = await fetch(url);
  return handleResponse<DashboardStats>(response);
}

// Resources
export async function fetchResources(category?: string, page: number = 1): Promise<ApiResponse<Resource[]>> {
  const url = buildUrl('resources.php', { category, page });
  const response = await fetch(url);
  return handleResponse<Resource[]>(response);
}

export async function createResource(data: Partial<Resource>): Promise<ApiResponse<Resource>> {
  const url = buildUrl('resources.php');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(response);
}

export async function updateResource(id: string, data: Partial<Resource>): Promise<ApiResponse<Resource>> {
  const url = buildUrl('resources.php', { id });
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(response);
}

export async function deleteResource(id: string): Promise<ApiResponse<null>> {
  const url = buildUrl('resources.php', { id });
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<null>(response);
}

// Categories
export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  const url = buildUrl('categories.php');
  const response = await fetch(url);
  return handleResponse<Category[]>(response);
}

export async function createCategory(data: Partial<Category>): Promise<ApiResponse<Category>> {
  const url = buildUrl('categories.php');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<ApiResponse<Category>> {
  const url = buildUrl('categories.php', { id });
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  const url = buildUrl('categories.php', { id });
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<null>(response);
}

// Submissions
export async function fetchSubmissions(status?: string, page: number = 1): Promise<ApiResponse<Submission[]>> {
  const url = buildUrl('submissions.php', { status, page });
  const response = await fetch(url);
  return handleResponse<Submission[]>(response);
}

export async function submitApiKit(data: {
  name: string;
  email: string;
  tool_name: string;
  description: string;
  api_link: string;
}): Promise<ApiResponse<Submission>> {
  const url = buildUrl('submissions.php');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Submission>(response);
}

export async function updateSubmissionStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<ApiResponse<Submission>> {
  const url = buildUrl('submissions.php', { id });
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes: notes }),
  });
  return handleResponse<Submission>(response);
}

export async function deleteSubmission(id: string): Promise<ApiResponse<null>> {
  const url = buildUrl('submissions.php', { id });
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<null>(response);
}

// Messages
export async function fetchMessages(status?: string, page: number = 1): Promise<ApiResponse<Message[]>> {
  const url = buildUrl('messages.php', { status, page });
  const response = await fetch(url);
  return handleResponse<Message[]>(response);
}

export async function submitContactForm(data: { 
  name: string; 
  email: string; 
  message: string; 
}): Promise<ApiResponse<Message>> {
  const url = buildUrl('messages.php');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Message>(response);
}

export async function updateMessageStatus(
  id: string,
  status: 'read' | 'replied',
  notes?: string
): Promise<ApiResponse<Message>> {
  const url = buildUrl('messages.php', { id });
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes: notes }),
  });
  return handleResponse<Message>(response);
}

export async function deleteMessage(id: string): Promise<ApiResponse<null>> {
  const url = buildUrl('messages.php', { id });
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<null>(response);
}

// Users
export async function fetchUsers(): Promise<ApiResponse<User[]>> {
  const url = buildUrl('auth/users.php');
  const response = await fetch(url);
  return handleResponse<User[]>(response);
}

export async function updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
  const url = buildUrl('auth/users.php', { id });
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  const url = buildUrl('auth/users.php', { id });
  const response = await fetch(url, {
    method: 'DELETE',
  });
  return handleResponse<null>(response);
}

// File Upload
export async function uploadFile(file: File, type: 'logo' = 'logo'): Promise<ApiResponse<{ path: string }>> {
  const url = buildUrl('upload.php');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<{ path: string }>(response);
}

// View Tracking
export async function trackView(type: 'resource' | 'category', id: string): Promise<void> {
  const url = buildUrl('stats.php');
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    });
  } catch (error) {
    console.error('Failed to track view:', error);
  }
}

// Types
export interface ApiResponse<T> {
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
  id: string;
  name: string;
  description: string;
  url: string;
  category_id: string;
  category_name?: string;
  logo?: string;
  is_featured: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  label: string;
  slug: string;
  total_resources: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  tool_name: string;
  description: string;
  api_link: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}
