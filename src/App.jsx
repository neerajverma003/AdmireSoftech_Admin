import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminDataProvider } from './context/AdminDataContext';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import InquiriesPage from './pages/Inquiries/InquiriesPage';
import QuotesPage from './pages/Quotes/QuotesPage';
import CareersPage from './pages/Careers/CareersPage';
import FreelancePage from './pages/Freelance/FreelancePage';
import ServicesPage from './pages/Services/ServicesPage';
import CaseStudiesPage from './pages/CaseStudies/CaseStudiesPage';
import IndustriesPage from './pages/Industries/IndustriesPage';
import TeamPage from './pages/Team/TeamPage';
import TestimonialsPage from './pages/Testimonials/TestimonialsPage';
import FaqsPage from './pages/Faqs/FaqsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import NotificationEmailsPage from './pages/Settings/NotificationEmailsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import EstimatorBuilderPage from './pages/EstimatorBuilder/EstimatorBuilderPage';
import OutreachPage from './pages/Outreach/OutreachPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminDataProvider>
          <Router>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="inquiries" element={<InquiriesPage />} />
                <Route path="quotes" element={<QuotesPage />} />
                <Route path="outreach" element={<OutreachPage />} />
                <Route path="estimator-builder" element={<EstimatorBuilderPage />} />
                <Route path="quotes/customizer" element={<EstimatorBuilderPage />} />
                <Route path="careers" element={<CareersPage />} />
                <Route path="freelance" element={<FreelancePage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="case-studies" element={<CaseStudiesPage />} />
                <Route path="industries" element={<IndustriesPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="reviews" element={<TestimonialsPage />} />
                <Route path="faqs" element={<FaqsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/notifications" element={<NotificationEmailsPage />} />
                <Route path="notifications" element={<NotificationEmailsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AdminDataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
