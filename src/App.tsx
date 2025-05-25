import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Profile Page
import ProfilePage from './pages/profile/ProfilePage';

// Admin Pages
import TeacherListPage from './pages/admin/TeacherListPage';
import TeacherDetailPage from './pages/admin/TeacherDetailPage';

// Class Pages
import ClassListPage from './pages/class/ClassListPage';
import ClassFormPage from './pages/class/ClassFormPage';
import ClassDetailPage from './pages/class/ClassDetailPage';
import ClassDashboardPage from './pages/class/ClassDashboardPage';

// Student Pages
import StudentListPage from './pages/student/StudentListPage';
import StudentFormPage from './pages/student/StudentFormPage';
import StudentDetailPage from './pages/student/StudentDetailPage';

// Todo Pages
import TaskManagementPage from './pages/task/TaskManagementPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          {/* Main App Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Admin Routes */}
          <Route path="/teachers" element={<TeacherListPage />} />
          <Route path="/teachers/:id" element={<TeacherDetailPage />} />
          
          {/* Class Routes */}
          <Route path="/classes" element={<ClassListPage />} />
          <Route path="/classes/new" element={<ClassFormPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
          <Route path="/classes/:id/edit" element={<ClassFormPage />} />
          <Route path="/classes/:id/dashboard" element={<ClassDashboardPage />} />
          
          {/* Student Routes */}
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id" element={<StudentDetailPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
          
          {/* Todo Routes */}
          <Route path="/todos" element={<TaskManagementPage />} />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/classes" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;