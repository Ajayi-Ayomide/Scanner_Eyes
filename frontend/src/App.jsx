import React from 'react';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import Vulnerabilities from './Components/Vulnerabilities';
import Settings from './Components/Settings';
import Scan from './Components/Scan';
import ChatBot from './Components/ChatBot';
import History from "./Components/History";
import Analytics from './Components/Analytics';
import './index.css'; 
import { Route, Routes} from 'react-router-dom';
import FixAssistant from './Components/FixAssistant';
import Login from './Components/Login';
import Signup from './Components/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { useLocation, Navigate } from 'react-router-dom';

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101c2a] font-sans">
      {children}
    </div>
  );
}

import { Outlet } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#101c2a]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function MainLayout() {
  return (
    <div className="flex h-screen font-sans">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
          <Route path="/vulnerabilities" element={<ProtectedRoute><Vulnerabilities /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/fix-assistant" element={<ProtectedRoute><FixAssistant /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}



export default App;
