import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Pages
const ResourcesPage = React.lazy(() => import('./pages/resources/ResourcesPage').then(module => ({ default: module.ResourcesPage })));
const AboutPage = React.lazy(() => import('./pages/static/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/static/ContactPage').then(module => ({ default: module.ContactPage })));
const PrivacyPage = React.lazy(() => import('./pages/static/PrivacyPage').then(module => ({ default: module.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/static/TermsPage').then(module => ({ default: module.TermsPage })));

// Admin Pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Resources = React.lazy(() => import('./pages/admin/Resources'));
const Categories = React.lazy(() => import('./pages/admin/Categories'));
const Submissions = React.lazy(() => import('./pages/admin/Submissions'));
const Messages = React.lazy(() => import('./pages/admin/Messages'));
const Users = React.lazy(() => import('./pages/admin/Users'));

// Auth Pages
const LoginPage = React.lazy(() => import('./pages/admin/auth/LoginPage').then(module => ({ default: module.default })));
const SetupPage = React.lazy(() => import('./pages/admin/auth/SetupPage').then(module => ({ default: module.default })));

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Admin Layout Wrapper
const AdminLayoutWrapper = () => (
  <AdminLayout>
    <Outlet />
  </AdminLayout>
);

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<ResourcesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Admin Auth Routes */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/setup" element={<SetupPage />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayoutWrapper />}>
                <Route index element={<Dashboard />} />
                <Route path="resources" element={<Resources />} />
                <Route path="categories" element={<Categories />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="messages" element={<Messages />} />
                <Route path="users" element={<Users />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
