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
