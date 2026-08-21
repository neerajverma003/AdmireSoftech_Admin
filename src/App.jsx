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
import TeamPage from './pages/Team/TeamPage';
import TestimonialsPage from './pages/Testimonials/TestimonialsPage';
import FaqsPage from './pages/Faqs/FaqsPage';
import SettingsPage from './pages/Settings/SettingsPage';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
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
                <Route path="careers" element={<CareersPage />} />
                <Route path="freelance" element={<FreelancePage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="team" element={<TeamPage />} />
                <Route path="testimonials" element={<TestimonialsPage />} />
                <Route path="reviews" element={<TestimonialsPage />} />
                <Route path="faqs" element={<FaqsPage />} />
                <Route path="settings" element={<SettingsPage />} />
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
