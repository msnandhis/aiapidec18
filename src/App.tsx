import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

// Pages
const ResourcesPage = React.lazy(() => import('./pages/resources/ResourcesPage').then(m => ({ default: m.default })));
const AboutPage = React.lazy(() => import('./pages/static/AboutPage').then(m => ({ default: m.default })));
const ContactPage = React.lazy(() => import('./pages/static/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = React.lazy(() => import('./pages/static/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import('./pages/static/TermsPage').then(m => ({ default: m.TermsPage })));

// Admin Pages
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.default })));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.default })));
const Resources = React.lazy(() => import('./pages/admin/Resources').then(m => ({ default: m.default })));
const Categories = React.lazy(() => import('./pages/admin/Categories').then(m => ({ default: m.default })));
const Submissions = React.lazy(() => import('./pages/admin/Submissions').then(m => ({ default: m.default })));
const Messages = React.lazy(() => import('./pages/admin/Messages').then(m => ({ default: m.default })));
const Users = React.lazy(() => import('./pages/admin/Users').then(m => ({ default: m.default })));

// Auth Pages
const LoginPage = React.lazy(() => import('./pages/admin/auth/LoginPage').then(m => ({ default: m.default })));
const SetupPage = React.lazy(() => import('./pages/admin/auth/SetupPage').then(m => ({ default: m.default })));

// Loading Component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
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
              <Route path="/admin" element={<AdminLayout />}>
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
