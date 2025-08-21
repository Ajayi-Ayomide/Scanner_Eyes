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

import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <div className="flex h-screen font-sans">
      {!isAuthPage && <Sidebar />}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/fix-assistant" element={<FixAssistant />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </div>
  );
}



export default App;
