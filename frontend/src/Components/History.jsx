import React, { useEffect, useState } from "react";
import { FaHistory, FaClock, FaNetworkWired, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner } from "react-icons/fa";
import axios from "axios";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/scan/history");
      setHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch scan history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScanTypeIcon = (scanType) => {
    switch (scanType) {
      case "auto":
        return <FaNetworkWired className="text-teal-400" />;
      case "manual":
        return <FaShieldAlt className="text-blue-400" />;
      default:
        return <FaHistory className="text-gray-400" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="text-green-400" />;
      case "failed":
        return <FaExclamationTriangle className="text-red-400" />;
      case "in_progress":
        return <FaSpinner className="animate-spin text-yellow-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans p-8">
      <h2 className="text-2xl font-bold mb-6">Scan History</h2>

      {/* Main History Interface */}
      <div className="bg-[#16243a] rounded-xl shadow p-6 mb-8">
        <div className="flex items-center mb-6">
          <FaHistory className="text-teal-400 text-2xl mr-3" />
          <div>
            <div className="font-semibold text-lg">Scan History</div>
            <div className="text-gray-400 text-sm">View all your previous network scans and results</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-teal-400 text-2xl mr-3" />
            <span>Loading scan history...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="text-gray-400 text-4xl mx-auto mb-4" />
            <div className="text-gray-400 text-lg mb-2">No scan history available</div>
            <div className="text-gray-500 text-sm">Run your first scan to see results here</div>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((entry, index) => (
              <div
                key={index}
                className="bg-[#22334d] p-6 rounded-xl shadow-md border border-gray-700 hover:shadow-lg transition"
              >
                {/* Scan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getScanTypeIcon(entry.scan_type)}
                    <div className="ml-3">
                      <div className="font-semibold text-lg">
                        {entry.scan_type === "auto" ? "Auto Discovery Scan" : "Manual Scan"}
                      </div>
                      <div className="text-sm text-gray-400">
                        {entry.ip || "Network scan"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(entry.status)}
                    <span className="text-sm text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Scan Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#16243a] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Scan Type</div>
                    <div className="font-semibold capitalize">{entry.scan_type || "full_scan"}</div>
                  </div>
                  <div className="bg-[#16243a] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Status</div>
                    <div className="font-semibold capitalize">{entry.status || "completed"}</div>
                  </div>
                  <div className="bg-[#16243a] p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Devices Found</div>
                    <div className="font-semibold">
                      {entry.scan_results ? entry.scan_results.length : 0}
                    </div>
                  </div>
                </div>

                {/* Scan Results */}
                {entry.scan_results && entry.scan_results.length > 0 && (
                  <div>
                    <div className="text-sm font-semibold mb-3 text-gray-300">Scan Results:</div>
                    <div className="space-y-2">
                      {entry.scan_results.map((result, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#16243a] px-4 py-3 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div>
                              <div className="font-semibold text-sm">
                                {result.device_name || `Device ${i + 1}`}
                              </div>
                              <div className="text-xs text-gray-400">
                                {result.ip_address || result.ip || entry.ip}
                              </div>
                            </div>
                            {result.risk_level && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(result.risk_level)}`}>
                                {result.risk_level} Risk
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            {result.port && (
                              <div className="text-sm text-gray-300">Port {result.port}</div>
                            )}
                            <div className={`text-xs font-semibold ${
                              result.status === "open" ? "text-green-400" : 
                              result.status === "closed" ? "text-red-400" : 
                              "text-yellow-400"
                            }`}>
                              {result.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Results (for backward compatibility) */}
                {(!entry.scan_results || entry.scan_results.length === 0) && entry.raw_results && (
                  <div>
                    <div className="text-sm font-semibold mb-3 text-gray-300">Port Scan Results:</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {entry.raw_results.map((res, i) => (
                        <div key={i} className="flex justify-between text-sm bg-[#16243a] px-3 py-2 rounded">
                          <span>Port {res.port}</span>
                          <span className={`font-bold ${
                            res.status === "open" ? "text-green-400" : 
                            res.status === "closed" ? "text-red-400" : 
                            "text-yellow-400"
                          }`}>
                            {res.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#16243a] rounded-xl p-6 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer">
          <FaNetworkWired className="text-teal-400 text-3xl mb-3" />
          <div className="font-semibold text-lg mb-1">New Auto Scan</div>
          <div className="text-gray-400 text-sm text-center">Start a new automatic network discovery</div>
        </div>
        
        <div className="bg-[#16243a] rounded-xl p-6 flex flex-col items-center shadow hover:shadow-lg transition cursor-pointer">
          <FaShieldAlt className="text-blue-400 text-3xl mb-3" />
          <div className="font-semibold text-lg mb-1">Manual Scan</div>
          <div className="text-gray-400 text-sm text-center">Scan a specific IP address or device</div>
        </div>
      </div>
    </div>
  );
}
