import React, { useState, useEffect } from "react";
import { FaChartBar, FaDownload, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaCalendar, FaNetworkWired, FaFileExport, FaFilePdf, FaFileCsv } from "react-icons/fa";
import axios from "axios";

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({
    totalScans: 0,
    totalVulnerabilities: 0,
    criticalVulnerabilities: 0,
    highVulnerabilities: 0,
    mediumVulnerabilities: 0,
    lowVulnerabilities: 0,
    fixedVulnerabilities: 0,
    securityScore: 0,
    recentActivity: [],
    vulnerabilityTrends: [],
    deviceTypes: [],
    scanHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [exportFormat, setExportFormat] = useState("pdf"); // pdf, csv, json

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/analytics/?range=${dateRange}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Mock data for development
      setAnalyticsData({
        totalScans: 24,
        totalVulnerabilities: 15,
        criticalVulnerabilities: 3,
        highVulnerabilities: 5,
        mediumVulnerabilities: 4,
        lowVulnerabilities: 3,
        fixedVulnerabilities: 8,
        securityScore: 72,
        recentActivity: [
          { id: 1, type: "scan", description: "Auto scan completed", timestamp: "2024-01-15T10:30:00Z", severity: "info" },
          { id: 2, type: "vulnerability", description: "Critical vulnerability found", timestamp: "2024-01-15T10:25:00Z", severity: "critical" },
          { id: 3, type: "fix", description: "Vulnerability marked as fixed", timestamp: "2024-01-15T10:20:00Z", severity: "success" }
        ],
        vulnerabilityTrends: [
          { date: "2024-01-09", critical: 2, high: 3, medium: 2, low: 1 },
          { date: "2024-01-10", critical: 3, high: 4, medium: 3, low: 2 },
          { date: "2024-01-11", critical: 3, high: 5, medium: 4, low: 2 },
          { date: "2024-01-12", critical: 2, high: 4, medium: 3, low: 2 },
          { date: "2024-01-13", critical: 3, high: 5, medium: 4, low: 3 },
          { date: "2024-01-14", critical: 3, high: 5, medium: 4, low: 3 },
          { date: "2024-01-15", critical: 3, high: 5, medium: 4, low: 3 }
        ],
        deviceTypes: [
          { type: "IP Camera", count: 8, vulnerabilities: 6 },
          { type: "Router", count: 2, vulnerabilities: 3 },
          { type: "Server", count: 1, vulnerabilities: 2 },
          { type: "Desktop", count: 3, vulnerabilities: 4 }
        ],
        scanHistory: [
          { id: 1, type: "auto", status: "completed", devices_found: 12, vulnerabilities_found: 8, timestamp: "2024-01-15T10:30:00Z" },
          { id: 2, type: "manual", status: "completed", devices_found: 1, vulnerabilities_found: 2, timestamp: "2024-01-15T09:15:00Z" },
          { id: 3, type: "auto", status: "completed", devices_found: 10, vulnerabilities_found: 6, timestamp: "2024-01-14T15:45:00Z" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const exportReport = async (format) => {
    try {
      const response = await axios.get(`http://localhost:8000/analytics/export?format=${format}&range=${dateRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `security_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical": return "text-red-400";
      case "high": return "text-orange-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      case "success": return "text-green-400";
      case "info": return "text-blue-400";
      default: return "text-gray-400";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical": return <FaExclamationTriangle className="text-red-400" />;
      case "high": return <FaExclamationTriangle className="text-orange-400" />;
      case "medium": return <FaExclamationTriangle className="text-yellow-400" />;
      case "low": return <FaCheckCircle className="text-green-400" />;
      case "success": return <FaCheckCircle className="text-green-400" />;
      case "info": return <FaShieldAlt className="text-blue-400" />;
      default: return <FaShieldAlt className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Security Analytics</h1>
              <p className="text-gray-400">Comprehensive security metrics and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-[#16243a] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-400"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>

              {/* Export Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="bg-[#16243a] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
                <button
                  onClick={() => exportReport(exportFormat)}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FaDownload />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
            <span className="ml-3">Loading analytics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Key Metrics */}
            <div className="lg:col-span-1 space-y-6">
              {/* Security Score */}
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Security Score</h2>
                  <FaShieldAlt className="text-teal-400 text-2xl" />
                </div>
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getSecurityScoreColor(analyticsData.securityScore)}`}>
                    {analyticsData.securityScore}
                  </div>
                  <div className="text-gray-400 mt-2">out of 100</div>
                  <div className="mt-4">
                    <div className="w-full bg-[#22334d] rounded-full h-3">
                      <div 
                        className="bg-teal-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analyticsData.securityScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vulnerability Summary */}
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Vulnerability Summary</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-red-400">Critical</span>
                    <span className="font-semibold">{analyticsData.criticalVulnerabilities}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400">High</span>
                    <span className="font-semibold">{analyticsData.highVulnerabilities}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">Medium</span>
                    <span className="font-semibold">{analyticsData.mediumVulnerabilities}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Low</span>
                    <span className="font-semibold">{analyticsData.lowVulnerabilities}</span>
                  </div>
                  <hr className="border-gray-600 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Fixed</span>
                    <span className="font-semibold">{analyticsData.fixedVulnerabilities}</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#22334d] rounded-lg">
                    <div className="flex items-center">
                      <FaNetworkWired className="text-teal-400 mr-3" />
                      <span>Total Scans</span>
                    </div>
                    <span className="font-semibold">{analyticsData.totalScans}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#22334d] rounded-lg">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="text-red-400 mr-3" />
                      <span>Total Vulnerabilities</span>
                    </div>
                    <span className="font-semibold">{analyticsData.totalVulnerabilities}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Charts and Activity */}
            <div className="lg:col-span-2 space-y-6">
              {/* Vulnerability Trends Chart */}
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Vulnerability Trends</h2>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.vulnerabilityTrends.map((trend, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col-reverse space-y-1 mb-2">
                        <div className="bg-red-500 rounded-t" style={{ height: `${(trend.critical / 5) * 100}%` }}></div>
                        <div className="bg-orange-500 rounded-t" style={{ height: `${(trend.high / 5) * 100}%` }}></div>
                        <div className="bg-yellow-500 rounded-t" style={{ height: `${(trend.medium / 5) * 100}%` }}></div>
                        <div className="bg-green-500 rounded-t" style={{ height: `${(trend.low / 5) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(trend.date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-6 mt-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    <span>Critical</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                    <span>Low</span>
                  </div>
                </div>
              </div>

              {/* Device Types */}
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Device Types</h2>
                <div className="space-y-3">
                  {analyticsData.deviceTypes.map((device, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#22334d] rounded-lg">
                      <div>
                        <div className="font-semibold">{device.type}</div>
                        <div className="text-sm text-gray-400">{device.count} devices</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-400">{device.vulnerabilities}</div>
                        <div className="text-sm text-gray-400">vulnerabilities</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {analyticsData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-[#22334d] rounded-lg">
                      {getSeverityIcon(activity.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{activity.description}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
