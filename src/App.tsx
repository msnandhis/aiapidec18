import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ResourcesPage } from './pages/resources/ResourcesPage';
import { AboutPage } from './pages/static/AboutPage';
import { ContactPage } from './pages/static/ContactPage';
import { PrivacyPage } from './pages/static/PrivacyPage';
import { TermsPage } from './pages/static/TermsPage';
import { ScrollToTop } from './shared/components/ScrollToTop';
import { AuthProvider, RequireAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/admin/auth/LoginPage';
import { SetupPage } from './pages/admin/auth/SetupPage';

// Lazy load admin routes for better initial load performance
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminResources = React.lazy(() => import('./pages/admin/Resources'));
const AdminCategories = React.lazy(() => import('./pages/admin/Categories'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminSubmissions = React.lazy(() => import('./pages/admin/Submissions'));
const AdminMessages = React.lazy(() => import('./pages/admin/Messages'));

// Loading component for lazy-loaded routes
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ResourcesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            
            {/* Auth Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/setup" element={<SetupPage />} />
            
            {/* Protected Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <RequireAuth>
                  <React.Suspense fallback={<LoadingFallback />}>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="resources" element={<AdminResources />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="submissions" element={<AdminSubmissions />} />
                        <Route path="messages" element={<AdminMessages />} />
                      </Routes>
                    </AdminLayout>
                  </React.Suspense>
                </RequireAuth>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
