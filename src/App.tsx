import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { setupGlobalErrorHandlers } from '@/lib/errorHandler';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import StudentManagement from '@/pages/StudentManagement';
import StudentEdit from '@/pages/StudentEdit';
import TeacherManagement from '@/pages/TeacherManagement';
import TeacherForm from '@/pages/TeacherForm';
import TeacherDetails from '@/pages/TeacherDetails';
import ClassManagement from '@/pages/ClassManagement';
import ClassForm from '@/pages/ClassForm';
import ClassDetails from '@/pages/ClassDetails';
import Layout from '@/components/Layout';
import TaskManagement from './pages/TaskManagement';
import StudentDetails from './pages/StudentDetails';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Register from '@/pages/Register';
import StudyMonitoring from './pages/StudyMonitoring';

// Setup global error handlers when the app loads
setupGlobalErrorHandlers();

const App = () => {
  return (
    <ErrorBoundary>
      <Router basename="/">
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Redirect root to login if not authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Profile route */}
              <Route path="profile" element={<TeacherDetails />} />
              
              {/* Student routes */}
              <Route path="students">
                <Route index element={<StudentManagement />} />
                <Route path=":id" element={<StudentDetails />} />
                <Route path=":id/edit" element={<StudentEdit />} />
              </Route>

              {/* Teacher routes */}
              <Route path="teachers">
                <Route index element={<TeacherManagement />} />
                <Route path="new" element={<TeacherForm />} />
                <Route path=":id" element={<TeacherDetails />} />
                <Route path=":id/edit" element={<TeacherForm />} />
              </Route>

              {/* Class routes */}
              <Route path="classes">
                <Route index element={<ClassManagement />} />
                <Route path="new" element={<ClassForm />} />
                <Route path=":id" element={<ClassDetails />} />
                <Route path=":id/edit" element={<ClassForm />} />
              </Route>

              {/* Task Management route */}
              <Route path="tasks" element={<TaskManagement />} />
              
              {/* Study Monitoring route */}
              <Route path="monitoring" element={<StudyMonitoring />} />
            </Route>
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
