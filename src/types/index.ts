// Resource Types
export interface Resource {
  id: string;
  name: string;
  category: string;
  logo: string;
  url?: string;
  description?: string;
  totalPages?: number;
  currentPage?: number;
  isFeatured?: boolean;
}

// Category Types
export interface Category {
  id: string;
  label: string;
  resource_count: number;
}

// Admin Types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  lastLogin?: string;
}

// Submission Types
export interface ApiSubmission {
  id: string;
  name: string;
  email: string;
  toolName: string;
  description: string;
  apiLink: string;
  status: SubmissionStatus;
  adminNotes?: string;
  createdAt: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// Message Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  adminNotes?: string;
  createdAt: string;
}

export type MessageStatus = 'unread' | 'read' | 'replied';

// Form Data Types
export interface ApiSubmissionForm {
  name: string;
  email: string;
  toolName: string;
  description: string;
  apiLink: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string | number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Admin Dashboard Types
export interface DashboardStats {
  totalResources: number;
  totalCategories: number;
  totalUsers: number;
  pendingSubmissions: number;
  unreadMessages: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'submission' | 'message' | 'resource' | 'user';
  action: string;
  user: string;
  target: string;
  timestamp: string;
}

// Config Types
export interface SiteConfig {
  turnstile_site_key: string;
  turnstile_secret_key: string;
}
