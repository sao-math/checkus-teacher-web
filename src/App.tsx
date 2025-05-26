import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
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

// Simple auth context for demo purposes
const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router basename="/checkus-teacher-web">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
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
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
