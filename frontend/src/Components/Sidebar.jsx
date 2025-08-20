// // src/components/Sidebar.js
// import React from 'react';
// import { NavLink } from 'react-router-dom';

// const TabButton = ({ label, icon, to }) => (
//   <NavLink
//     to={to}
//     className={({ isActive }) =>
//       `flex items-center px-4 py-2 mt-2 text-sm font-medium text-white transition-colors duration-200 transform rounded-lg w-full ${
//         isActive ? 'bg-red-800 text-slate-800' : 'hover:bg-gray-100 hover:text-slate-800'
//       }`
//     }
//   >
//     <span className="text-lg mr-2">{icon}</span>
//     {label}
//   </NavLink>
// );

// const Sidebar = () => (
//   <div className="w-64 h-screen p-4 border-r bg-[#101c2a] text-white font-sans">
//     <h1 className="text-xl font-bold mb-6">Scanner Eyes</h1>
//     <TabButton className="text-white" label="Dashboard" icon="🏠" to="/" />
//     <TabButton className="text-white" label="Vulnerabilities" icon="🛡" to="/vulnerabilities" />
//     <TabButton className="text-white" label="Suggestions" icon="💡" to="/suggestions" />
//     <TabButton className="text-white" label="Settings" icon="⚙" to="/settings" />
//     <TabButton className="text-white" label="Fix Assistant " icon="🤖" to="/fix-assistant" />
//   </div>
// );

// export default Sidebar;




import React from "react";
import { NavLink } from "react-router-dom";
import { FaShieldAlt, FaSearch, FaBug, FaTools, FaCog, FaHistory, FaChartBar } from "react-icons/fa";

const navItems = [
  { to: "/", label: "Dashboard", icon: <FaShieldAlt /> },
  { to: "/scan", label: "Network Scan", icon: <FaSearch /> },
  { to: "/vulnerabilities", label: "Vulnerabilities", icon: <FaBug /> },
  { to: "/fix-assistant", label: "Fix Assistant", icon: <FaTools /> },
  { to: "/analytics", label: "Analytics", icon: <FaChartBar /> },
  { to: "/history", label: "History", icon: <FaHistory /> },
  { to: "/settings", label: "Settings", icon: <FaCog /> },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#16243a] flex flex-col py-6 px-2 min-h-screen">
      <div className="flex items-center mb-8 px-4">
        <FaShieldAlt className="text-teal-400 text-2xl mr-2" />
        <span className="text-xl font-bold text-white">IoT SecScan</span>
      </div>
      <nav className="flex-1">
        {navItems.map(({ to, label, icon, color }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg mb-2 font-medium transition-colors ${
                isActive
                  ? "bg-teal-500 text-white"
                  : `hover:bg-[#22334d] text-gray-300 ${color || ""}`
              }`
            }
          >
            <span className={`mr-3 text-lg ${color || ""}`}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto px-4 pt-8">
        <div className="flex items-center space-x-3">
          <div className="bg-[#22334d] rounded-full p-2">
            <FaShieldAlt className="text-teal-400 text-xl" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm">Admin User</div>
            <div className="text-xs text-gray-400">admin@company.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}