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

function App() {
  return (
    <div className="flex h-screen font-sans">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/fix-assistant" element={<FixAssistant />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
        </Routes>

      </div>
    </div>
  );
}



export default App;
