
import React, { useState } from "react";
import { FaNetworkWired, FaSearch, FaCamera, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaHistory, FaWifi, FaServer, FaDesktop, FaTools, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Scan() {
  const [scanType, setScanType] = useState("auto");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState([]);
  const [scanMessage, setScanMessage] = useState("");
  const [manualIP, setManualIP] = useState("");
  const [manualPorts, setManualPorts] = useState("80,443,554,8000,8080");
  const [scanProgress, setScanProgress] = useState(0);
  const [activeScan, setActiveScan] = useState(null);
  const [quickScanIP, setQuickScanIP] = useState("");
  const navigate = useNavigate();

  const startAutoScan = async () => {
    setScanning(true);
    setScanProgress(0);
    setScanMessage("🔍 Initializing network discovery...");
    setScanResults([]);
    setActiveScan("auto");

    try {
      // Simulate scanning phases
      const phases = [
        { progress: 20, message: "🔍 Discovering network devices..." },
        { progress: 40, message: "📡 Scanning common camera ports..." },
        { progress: 60, message: "🔒 Analyzing device vulnerabilities..." },
        { progress: 80, message: "📊 Compiling security report..." },
        { progress: 100, message: "✅ Network scan completed!" }
      ];

      for (let i = 0; i < phases.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setScanProgress(phases[i].progress);
        setScanMessage(phases[i].message);
      }

      const response = await axios.post("http://localhost:8001/scan/auto");
      const cameras = response.data.cameras || [];
      
      // Format results for display
      const formattedResults = cameras.map((camera, index) => ({
        id: index + 1,
        device_name: camera.device_name || `Device ${index + 1}`,
        ip_address: camera.ip,
        risk_level: camera.risk_level || "Medium",
        status: camera.status || "Active",
        open_ports: camera.open_ports || [],
        device_type: camera.device_type || "Network Device",
        last_seen: new Date(camera.last_seen).toLocaleString(),
        vulnerabilities: camera.vulnerabilities || []
      }));
      
      setScanResults(formattedResults);
      setActiveScan(null);
    } catch (error) {
      console.error("Auto scan error:", error);
      setScanMessage("❌ Auto scan failed. Please check your network connection.");
      setActiveScan(null);
    } finally {
      setScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const startManualScan = async () => {
    if (!manualIP.trim()) {
      setScanMessage("❌ Please enter an IP address");
      return;
    }

    setScanning(true);
    setScanProgress(0);
    setScanMessage("🔍 Initializing manual scan...");
    setScanResults([]);
    setActiveScan("manual");

    try {
      const ports = manualPorts.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
      
      // Simulate scanning phases
      const phases = [
        { progress: 30, message: `🔍 Scanning ${manualIP}...` },
        { progress: 60, message: "🔒 Checking port vulnerabilities..." },
        { progress: 90, message: "📊 Analyzing security posture..." },
        { progress: 100, message: "✅ Manual scan completed!" }
      ];

      for (let i = 0; i < phases.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setScanProgress(phases[i].progress);
        setScanMessage(phases[i].message);
      }

      const response = await axios.post("http://localhost:8001/scan/", {
        ip: manualIP.trim(),
        ports: ports,
        scan_type: "manual_scan"
      });
      
      const devices = response.data.devices || [];
      
      const formattedResults = devices.map((device, index) => ({
        id: index + 1,
        device_name: device.device_name || `Device ${index + 1}`,
        ip_address: device.ip,
        risk_level: device.risk_level || "Medium",
        status: device.status || "Active",
        open_ports: device.open_ports || [],
        device_type: device.device_type || "Network Device",
        last_seen: new Date(device.last_seen).toLocaleString(),
        vulnerabilities: device.vulnerabilities || []
      }));
      
      setScanResults(formattedResults);
      setActiveScan(null);
    } catch (error) {
      console.error("Manual scan error:", error);
      setScanMessage("❌ Manual scan failed. Please check the IP address and try again.");
      setActiveScan(null);
    } finally {
      setScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const startQuickScan = async () => {
    if (!quickScanIP.trim()) {
      setScanMessage("❌ Please enter an IP address for quick scan");
      return;
    }

    setScanning(true);
    setScanProgress(0);
    setScanMessage(`🔍 Quick scanning ${quickScanIP}...`);
    setScanResults([]);
    setActiveScan("quick");

    try {
      // Simulate quick scan phases
      const phases = [
        { progress: 50, message: `🔍 Scanning ${quickScanIP}...` },
        { progress: 100, message: "✅ Quick scan completed!" }
      ];

      for (let i = 0; i < phases.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setScanProgress(phases[i].progress);
        setScanMessage(phases[i].message);
      }

      const response = await axios.get(`http://localhost:8001/scan/quick/${quickScanIP}`);
      const device = response.data.device;
      
      if (device) {
        const formattedResult = [{
          id: 1,
          device_name: device.device_name || `Device`,
          ip_address: device.ip,
          risk_level: device.risk_level || "Medium",
          status: device.status || "Active",
          open_ports: device.open_ports || [],
          device_type: device.device_type || "Network Device",
          last_seen: new Date(device.last_seen).toLocaleString(),
          vulnerabilities: device.vulnerabilities || []
        }];
        
        setScanResults(formattedResult);
      } else {
        setScanMessage("❌ No open ports found on this IP address");
      }
      
      setActiveScan(null);
    } catch (error) {
      console.error("Quick scan error:", error);
      setScanMessage("❌ Quick scan failed. Please check the IP address and try again.");
      setActiveScan(null);
    } finally {
      setScanning(false);
      setTimeout(() => setScanProgress(0), 2000);
    }
  };

  const handleStartScan = () => {
    if (scanType === "auto") {
      startAutoScan();
    } else if (scanType === "manual") {
      startManualScan();
    } else if (scanType === "quick") {
      startQuickScan();
    }
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case "ip camera": return <FaCamera className="text-blue-400" />;
      case "server": return <FaServer className="text-purple-400" />;
      case "desktop": return <FaDesktop className="text-green-400" />;
      default: return <FaNetworkWired className="text-teal-400" />;
    }
  };

  const handleGetFixes = (device) => {
    // Navigate to FixAssistant with device info
    navigate('/fix-assistant', { 
      state: { 
        selectedDevice: device,
        fromScan: true 
      } 
    });
  };

  const handleViewVulnerabilities = () => {
    navigate('/vulnerabilities');
  };

  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Network Security Scanner</h1>
          <p className="text-gray-400">Discover and analyze IoT devices for security vulnerabilities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Scan Controls */}
          <div className="lg:col-span-1">
            <div className="bg-[#16243a] rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <FaNetworkWired className="text-teal-400 text-2xl mr-3" />
                <h2 className="text-xl font-semibold">Scan Controls</h2>
              </div>

              {/* Scan Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">Scan Type</label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 bg-[#22334d] rounded-lg cursor-pointer hover:bg-[#2a3a5a] transition">
                    <input
                      type="radio"
                      name="scanType"
                      value="auto"
                      checked={scanType === "auto"}
                      onChange={(e) => setScanType(e.target.value)}
                      className="mr-3 text-teal-400"
                    />
                    <div className="flex items-center">
                      <FaWifi className="mr-2 text-teal-400" />
                      <div>
                        <div className="font-medium">Auto Discovery</div>
                        <div className="text-xs text-gray-400">Find all IoT devices</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 bg-[#22334d] rounded-lg cursor-pointer hover:bg-[#2a3a5a] transition">
                    <input
                      type="radio"
                      name="scanType"
                      value="manual"
                      checked={scanType === "manual"}
                      onChange={(e) => setScanType(e.target.value)}
                      className="mr-3 text-teal-400"
                    />
                    <div className="flex items-center">
                      <FaSearch className="mr-2 text-blue-400" />
                      <div>
                        <div className="font-medium">Manual Scan</div>
                        <div className="text-xs text-gray-400">Target specific IP</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 bg-[#22334d] rounded-lg cursor-pointer hover:bg-[#2a3a5a] transition">
                    <input
                      type="radio"
                      name="scanType"
                      value="quick"
                      checked={scanType === "quick"}
                      onChange={(e) => setScanType(e.target.value)}
                      className="mr-3 text-teal-400"
                    />
                    <div className="flex items-center">
                      <FaShieldAlt className="mr-2 text-green-400" />
                      <div>
                        <div className="font-medium">Quick Scan</div>
                        <div className="text-xs text-gray-400">Fast port check</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Manual Scan Inputs */}
              {scanType === "manual" && (
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target IP Address</label>
                    <input
                      type="text"
                      value={manualIP}
                      onChange={(e) => setManualIP(e.target.value)}
                      placeholder="192.168.1.100"
                      className="w-full bg-[#22334d] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Ports to Scan</label>
                    <input
                      type="text"
                      value={manualPorts}
                      onChange={(e) => setManualPorts(e.target.value)}
                      placeholder="80,443,554,8000,8080"
                      className="w-full bg-[#22334d] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>
                </div>
              )}

              {/* Quick Scan Inputs */}
              {scanType === "quick" && (
                <div className="mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target IP Address</label>
                    <input
                      type="text"
                      value={quickScanIP}
                      onChange={(e) => setQuickScanIP(e.target.value)}
                      placeholder="192.168.1.100"
                      className="w-full bg-[#22334d] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-400"
                    />
                    <p className="text-xs text-gray-400 mt-1">Quick scan checks common ports (22, 23, 80, 443, 554, 8080)</p>
                  </div>
                </div>
              )}

              {/* Scan Button */}
              <button
                onClick={handleStartScan}
                disabled={scanning}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors flex items-center justify-center mb-4"
              >
                {scanning ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <FaSearch className="mr-2" />
                    Start {scanType === "auto" ? "Auto" : scanType === "manual" ? "Manual" : "Quick"} Scan
                  </>
                )}
              </button>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleViewVulnerabilities}
                  className="w-full bg-[#22334d] hover:bg-[#2a3a5a] text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors flex items-center justify-center"
                >
                  <FaExclamationTriangle className="mr-2" />
                  View All Vulnerabilities
                </button>
                
                <a
                  href="/history"
                  className="w-full bg-[#22334d] hover:bg-[#2a3a5a] text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors flex items-center justify-center block"
                >
                  <FaHistory className="mr-2" />
                  View Scan History
                </a>
              </div>

              {/* Scan Status */}
              {scanMessage && (
                <div className="mt-6 p-4 bg-[#22334d] rounded-lg">
                  <div className="flex items-center mb-2">
                    {scanning ? (
                      <FaSpinner className="animate-spin text-teal-400 mr-2" />
                    ) : scanMessage.includes("✅") ? (
                      <FaCheckCircle className="text-green-400 mr-2" />
                    ) : scanMessage.includes("❌") ? (
                      <FaExclamationTriangle className="text-red-400 mr-2" />
                    ) : (
                      <FaShieldAlt className="text-teal-400 mr-2" />
                    )}
                    <span className="text-sm font-medium">{scanMessage}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  {scanning && (
                    <div className="w-full bg-[#16243a] rounded-full h-2">
                      <div 
                        className="bg-teal-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${scanProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Scan Results */}
          <div className="lg:col-span-2">
            {/* Network Overview */}
            <div className="bg-[#16243a] rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Network Overview</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                    <span>Medium Risk</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                    <span>High Risk</span>
                  </div>
                </div>
              </div>

              {/* Network Visualization */}
              <div className="bg-[#22334d] rounded-lg p-6 mb-4">
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#16243a] rounded-full flex items-center justify-center mb-2">
                      <FaWifi className="text-teal-400 text-2xl" />
                    </div>
                    <div className="text-sm text-gray-400">Router</div>
                  </div>
                  
                  {scanResults.slice(0, 3).map((device, index) => (
                    <div key={device.id} className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        device.risk_level === "Critical" || device.risk_level === "High" ? "bg-red-500" :
                        device.risk_level === "Medium" ? "bg-yellow-500" : "bg-green-500"
                      }`}>
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div className="text-xs text-gray-400">{device.ip_address}</div>
                    </div>
                  ))}
                  
                  {scanResults.length > 3 && (
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                        <span className="text-xs">+{scanResults.length - 3}</span>
                      </div>
                      <div className="text-xs text-gray-400">More devices</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Scan Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#22334d] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-teal-400">{scanResults.length}</div>
                  <div className="text-sm text-gray-400">Devices Found</div>
                </div>
                <div className="bg-[#22334d] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {scanResults.filter(d => d.risk_level === "High" || d.risk_level === "Critical").length}
                  </div>
                  <div className="text-sm text-gray-400">High Risk</div>
                </div>
                <div className="bg-[#22334d] p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {scanResults.filter(d => d.risk_level === "Low").length}
                  </div>
                  <div className="text-sm text-gray-400">Secure</div>
                </div>
              </div>
            </div>

            {/* Scan Results */}
            {scanResults.length > 0 && (
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Scan Results</h2>
                  <span className="text-sm text-gray-400">{scanResults.length} devices found</span>
                </div>
                
                <div className="space-y-4">
                  {scanResults.map((device) => (
                    <div key={device.id} className="bg-[#22334d] rounded-lg p-4 hover:shadow-lg transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {getDeviceIcon(device.device_type)}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{device.device_name}</div>
                            <div className="text-sm text-gray-400">IP: {device.ip_address}</div>
                            <div className="text-xs text-gray-500">Last seen: {device.last_seen}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(device.risk_level)}`}>
                            {device.risk_level} Risk
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500 text-white">
                            {device.status}
                          </span>
                          <button
                            onClick={() => handleGetFixes(device)}
                            className="flex items-center bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <FaTools className="mr-1" />
                            Get Fixes
                            <FaArrowRight className="ml-1" />
                          </button>
                        </div>
                      </div>
                      
                      {device.open_ports && device.open_ports.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="text-sm text-gray-400 mb-2">Open Ports:</div>
                          <div className="flex flex-wrap gap-2">
                            {device.open_ports.map((port, index) => (
                              <span key={index} className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                                {port.port} ({port.service || 'Unknown'})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {device.vulnerabilities && device.vulnerabilities.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-600">
                          <div className="text-sm text-gray-400 mb-2">Vulnerabilities:</div>
                          <div className="space-y-2">
                            {device.vulnerabilities.map((vuln, index) => (
                              <div key={index} className="p-2 bg-red-900/30 rounded border-l-4 border-red-500">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-red-300">{vuln.type}</span>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    vuln.severity === 'Critical' ? 'bg-red-600 text-white' :
                                    vuln.severity === 'High' ? 'bg-orange-500 text-white' :
                                    vuln.severity === 'Medium' ? 'bg-yellow-500 text-black' :
                                    'bg-green-500 text-white'
                                  }`}>
                                    {vuln.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-300 mt-1">{vuln.description}</p>
                                {vuln.fix_suggestion && (
                                  <p className="text-xs text-green-300 mt-1">💡 {vuln.fix_suggestion}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!scanning && scanResults.length === 0 && (
              <div className="bg-[#16243a] rounded-xl shadow-lg p-12 text-center">
                <FaNetworkWired className="text-gray-400 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Scan Results</h3>
                <p className="text-gray-400 mb-6">Start a scan to discover devices on your network</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setScanType("auto")}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg"
                  >
                    Auto Discovery
                  </button>
                  <button
                    onClick={() => setScanType("manual")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    Manual Scan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
