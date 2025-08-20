
import React, { useState, useEffect } from "react";
import { FaExclamationTriangle, FaWifi, FaKey, FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { MdDevices, MdUpdate } from "react-icons/md";
import axios from "axios";

const riskLevels = [
  { label: "Critical", value: 3, color: "bg-red-600", bar: "bg-red-400" },
  { label: "High", value: 5, color: "bg-orange-500", bar: "bg-orange-400" },
  { label: "Medium", value: 8, color: "bg-yellow-400", bar: "bg-yellow-300" },
  { label: "Low", value: 8, color: "bg-green-500", bar: "bg-green-400" },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDevices: 0,
    openPorts: 0,
    activeThreats: 0,
    outdatedFirmware: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [criticalAlerts, setCriticalAlerts] = useState([]);
  const [securityScore, setSecurityScore] = useState(72);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch scan statistics
      const statsResponse = await axios.get("http://localhost:8000/scan/stats");
      
      // Fetch recent scan history
      const historyResponse = await axios.get("http://localhost:8000/scan/history");
      
      // Process the data
      const scanHistory = historyResponse.data || [];
      const recentScans = scanHistory.slice(0, 4);
      
      // Calculate stats
      const totalDevices = scanHistory.length;
      const openPorts = scanHistory.reduce((count, scan) => {
        return count + (scan.result?.filter(r => r.status === "open").length || 0);
      }, 0);
      
      const activeThreats = scanHistory.reduce((count, scan) => {
        return count + (scan.result?.filter(r => r.status === "open").length || 0);
      }, 0);
      
      // Generate recent activity from scan history
      const activity = recentScans.map(scan => {
        const openPortsCount = scan.result?.filter(r => r.status === "open").length || 0;
        if (openPortsCount > 0) {
          return {
            text: `${openPortsCount} open ports detected on ${scan.ip}`,
            color: "text-red-400",
            icon: <FaExclamationCircle />
          };
        } else {
          return {
            text: `Scan completed for ${scan.ip}`,
            color: "text-green-400",
            icon: <FaCheckCircle />
          };
        }
      });
      
      // Generate critical alerts from scan history
      const alerts = scanHistory
        .filter(scan => scan.result?.some(r => r.status === "open"))
        .slice(0, 2)
        .map(scan => {
          const openPorts = scan.result?.filter(r => r.status === "open") || [];
          return {
            title: `${openPorts.length} Open Ports Detected`,
            desc: `IP Camera - ${scan.ip}`,
            icon: <FaWifi className="text-red-400 mr-2" />,
          };
        });
      
      // Calculate security score (simplified)
      const score = Math.max(0, 100 - (activeThreats * 10));
      
      setStats({
        totalDevices,
        openPorts,
        activeThreats,
        outdatedFirmware: Math.floor(totalDevices * 0.2) // Estimate
      });
      setRecentActivity(activity);
      setCriticalAlerts(alerts);
      setSecurityScore(score);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Keep default values if API fails
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101c2a] text-white font-sans flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-teal-400 mb-4" />
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans flex">
      {/* Main Content */}
      <main className="flex-1 p-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Security Score Card */}
          <div className="bg-[#16243a] rounded-xl p-6 flex flex-col items-center justify-center w-full md:w-1/4 shadow">
            <div className="relative flex items-center justify-center mb-2">
              <svg width="100" height="100">
                <circle cx="50" cy="50" r="40" stroke="#22334d" strokeWidth="10" fill="none" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="#14b8a6" 
                  strokeWidth="10" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * securityScore / 100)} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-teal-400">{securityScore}</span>
                <span className="text-xs text-gray-400">
                  {securityScore >= 80 ? "Excellent" : securityScore >= 60 ? "Good" : securityScore >= 40 ? "Fair" : "Poor"}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-300">Security Score</div>
          </div>
          {/* Top Stats */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<MdDevices className="text-teal-400 text-xl" />} label="Total Devices" value={stats.totalDevices} />
            <StatCard icon={<FaWifi className="text-yellow-400 text-xl" />} label="Open Ports" value={stats.openPorts} />
            <StatCard icon={<FaExclamationTriangle className="text-red-400 text-xl" />} label="Active Threats" value={stats.activeThreats} />
            <StatCard icon={<MdUpdate className="text-orange-400 text-xl" />} label="Outdated Firmware" value={stats.outdatedFirmware} />
          </div>
        </div>
        {/* Activity and Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-[#16243a] rounded-xl p-6 shadow flex flex-col">
            <div className="font-semibold text-lg mb-4">Recent Activity</div>
            <ul className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((item, i) => (
                  <li key={i} className="flex items-center text-sm">
                    <span className={`mr-2 ${item.color}`}>{item.icon}</span>
                    {item.text}
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-sm">No recent activity</li>
              )}
            </ul>
          </div>
          {/* Risk Level Distribution */}
          <div className="bg-[#16243a] rounded-xl p-6 shadow flex flex-col">
            <div className="font-semibold text-lg mb-4">Risk Level Distribution</div>
            <div className="space-y-4">
              {riskLevels.map((level, i) => (
                <div key={level.label} className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${level.color}`}></span>
                  <span className="w-20 text-sm">{level.label}</span>
                  <div className="flex-1 mx-3 bg-[#22334d] rounded h-2 overflow-hidden">
                    <div className={`${level.bar} h-2 rounded`} style={{ width: `${level.value * 10 + 10}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-300">{level.value} devices</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Critical Alerts */}
        <div className="bg-[#16243a] rounded-xl p-6 shadow">
          <div className="font-semibold text-lg mb-4">Critical Alerts</div>
          <div className="space-y-4">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert, i) => (
                <div key={i} className="flex items-center bg-[#2a1e2e] rounded-lg p-4">
                  {alert.icon}
                  <div className="flex-1">
                    <div className="font-semibold text-red-400">{alert.title}</div>
                    <div className="text-xs text-gray-300">{alert.desc}</div>
                  </div>
                  <button className="ml-4 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-4 py-2 rounded transition">Fix Now</button>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No critical alerts</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-[#22334d] rounded-xl p-4 flex flex-col items-center shadow">
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}