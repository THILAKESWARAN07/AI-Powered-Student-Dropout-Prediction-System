import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';

import MainLayout from './components/layouts/MainLayout';
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SchoolManagement from './pages/SchoolManagement';
import UserManagement from './pages/UserManagement';
import ActivityLogs from './pages/ActivityLogs';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import StudentList from './pages/StudentList';
import StudentForm from './pages/StudentForm';
import StudentDetails from './pages/StudentDetails';
import ImportWizard from './pages/ImportWizard';
import RiskAnalysis from './pages/RiskAnalysis';
import ModelInfo from './pages/ModelInfo';
import Reports from './pages/Reports';
import XaiDashboard from './pages/XaiDashboard';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Website Pages */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<LandingPage />} />
              </Route>
 
              {/* Public Authentication routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
 
              {/* Secure Portal Panel Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  {/* Default redirect from /portal to dashboard */}
                  <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />
                  <Route path="/portal/dashboard" element={<Dashboard />} />
                  <Route path="/portal/schools" element={<SchoolManagement />} />
                  <Route path="/portal/profile" element={<Profile />} />
                  <Route path="/portal/settings" element={<Settings />} />
                  
                  {/* Student Management routes */}
                  <Route path="/portal/students" element={<StudentList />} />
                  <Route path="/portal/students/new" element={<StudentForm />} />
                  <Route path="/portal/students/:id" element={<StudentDetails />} />
                  <Route path="/portal/students/:id/edit" element={<StudentForm />} />
                  <Route path="/portal/students/import" element={<ImportWizard />} />
                  <Route path="/portal/risk-analysis" element={<RiskAnalysis />} />
                  <Route path="/portal/xai" element={<XaiDashboard />} />
                  <Route path="/portal/reports" element={<Reports />} />
                  <Route path="/portal/model-info" element={<ModelInfo />} />

                  {/* Admin & DEO specific views */}
                  <Route element={<ProtectedRoute allowedRoles={['admin', 'deo']} />}>
                    <Route path="/portal/users" element={<UserManagement />} />
                  </Route>

                  {/* Admin exclusive views */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/portal/logs" element={<ActivityLogs />} />
                  </Route>
                </Route>
              </Route>

              {/* 404 handler */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
