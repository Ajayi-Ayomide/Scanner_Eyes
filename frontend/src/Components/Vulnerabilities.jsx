
import React from "react";
import { FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaEye, FaWrench, FaShieldAlt } from "react-icons/fa";
import { MdWarning } from "react-icons/md";

const summary = [
  { label: "Critical", value: 3, color: "bg-red-600", icon: <FaExclamationCircle className="text-red-300 text-xl" /> },
  { label: "High", value: 5, color: "bg-orange-500", icon: <MdWarning className="text-orange-300 text-xl" /> },
  { label: "Medium", value: 8, color: "bg-yellow-400", icon: <FaExclamationTriangle className="text-yellow-200 text-xl" /> },
  { label: "Low", value: 8, color: "bg-green-600", icon: <FaInfoCircle className="text-green-300 text-xl" /> },
];

const vulnerabilities = [
  {
    device: "IP Camera – Living Room",
    ip: "192.168.1.101",
    risk: "Critical",
    issues: ["Weak Password", "Open Port 80"],
    actions: ["view", "fix", "ignore"],
  },
  {
    device: "Security Camera – Front Door",
    ip: "192.168.1.102",
    risk: "High",
    issues: ["Outdated Firmware"],
    actions: ["view", "fix", "ignore"],
  },
  {
    device: "Smart Doorbell",
    ip: "192.168.1.103",
    risk: "Medium",
    issues: ["Default Credentials"],
    actions: ["view", "fix", "ignore"],
  },
  {
    device: "NVR System",
    ip: "192.168.1.104",
    risk: "Low",
    issues: ["Minor Config Issue"],
    actions: ["view", "fix", "ignore"],
  },
];

const riskColors = {
  Critical: "bg-red-600 text-red-100",
  High: "bg-orange-500 text-orange-100",
  Medium: "bg-yellow-400 text-yellow-900",
  Low: "bg-green-600 text-green-100",
};

const actionIcons = {
  view: <FaEye className="text-teal-400 hover:text-teal-300" title="View" />,
  fix: <FaWrench className="text-yellow-400 hover:text-yellow-300" title="Fix" />,
  ignore: <FaShieldAlt className="text-red-400 hover:text-red-300" title="Ignore" />,
};

export default function Vulnerabilities() {
  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans p-8">
      <h2 className="text-2xl font-bold mb-6">Vulnerabilities</h2>
      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {summary.map((card) => (
          <div key={card.label} className={`flex items-center bg-[#16243a] rounded-xl p-4 shadow ${card.color}`} style={{ minWidth: 180 }}>
            <div className="mr-4">{card.icon}</div>
            <div>
              <div className="font-semibold text-lg">{card.label}</div>
              <div className="text-2xl font-bold">{card.value}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Search and Export */}
      <div className="flex justify-end items-center mb-4 gap-2">
        <input
          type="text"
          placeholder="Search vulnerabilities..."
          className="px-4 py-2 rounded-lg bg-[#16243a] text-gray-200 border border-[#22334d] focus:outline-none focus:ring-2 focus:ring-teal-400 w-64"
        />
        <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow">Export Report</button>
      </div>
      {/* Vulnerability Table */}
      <div className="bg-[#16243a] rounded-xl shadow p-4">
        <div className="font-semibold text-lg mb-2">Vulnerability Details</div>
        <table className="min-w-full text-sm rounded overflow-hidden">
          <thead>
            <tr className="bg-[#22334d] text-gray-200">
              <th className="px-4 py-2 text-left">DEVICE</th>
              <th className="px-4 py-2 text-left">IP ADDRESS</th>
              <th className="px-4 py-2 text-left">RISK LEVEL</th>
              <th className="px-4 py-2 text-left">ISSUES</th>
              <th className="px-4 py-2 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {vulnerabilities.map((vul, i) => (
              <tr key={i} className="border-b border-[#22334d] hover:bg-[#1e2d47] transition">
                <td className="px-4 py-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  {vul.device}
                </td>
                <td className="px-4 py-2">{vul.ip}</td>
                <td className="px-4 py-2">
                  <span className={`px-3 py-1 rounded-full font-semibold text-xs ${riskColors[vul.risk]}`}>{vul.risk}</span>
                </td>
                <td className="px-4 py-2">
                  {vul.issues.map((issue, idx) => (
                    <span key={idx} className="bg-[#22334d] text-gray-200 px-2 py-1 rounded mr-2 text-xs font-medium">{issue}</span>
                  ))}
                </td>
                <td className="px-4 py-2 flex gap-3">
                  {vul.actions.map((action, idx) => (
                    <span key={idx} className="cursor-pointer">{actionIcons[action]}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}