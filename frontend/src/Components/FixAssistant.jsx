
import React, { useState, useEffect } from "react";
import { FaLock, FaExclamationTriangle, FaDownload, FaRobot, FaUser, FaChevronDown, FaChevronUp, FaPaperPlane, FaSpinner, FaShieldAlt, FaTools, FaCheckCircle, FaArrowRight, FaBug } from "react-icons/fa";
import axios from "axios";

export default function FixAssistant() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [fixSteps, setFixSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState("vulnerabilities"); // vulnerabilities, chat, fixes

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get("http://localhost:8000/vulnerabilities/");
      setVulnerabilities(response.data.vulnerabilities || []);
    } catch (error) {
      console.error("Failed to fetch vulnerabilities:", error);
      // Mock data for development
      setVulnerabilities([
        {
          id: 1,
          device_name: "IP Camera 1",
          ip_address: "192.168.1.100",
          vulnerability_type: "Default Password",
          severity: "Critical",
          description: "Device is using default admin credentials",
          status: "Open",
          discovered_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          device_name: "Security Camera",
          ip_address: "192.168.1.101",
          vulnerability_type: "Open Port",
          severity: "High",
          description: "Port 554 (RTSP) is open and accessible",
          status: "Open",
          discovered_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 3,
          device_name: "Network Camera",
          ip_address: "192.168.1.102",
          vulnerability_type: "Outdated Firmware",
          severity: "Medium",
          description: "Device firmware is 2 years old",
          status: "Open",
          discovered_at: "2024-01-15T10:30:00Z"
        }
      ]);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const handleVulnerabilitySelect = async (vuln) => {
    setSelectedVuln(vuln);
    setActiveTab("fixes");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/assistant/fix", {
        vulnerability_type: vuln.vulnerability_type,
        description: vuln.description,
        device_ip: vuln.ip_address
      });

      setFixSteps(response.data.fix_steps || []);
    } catch (error) {
      console.error("Failed to get fix steps:", error);
      // Mock fix steps
      setFixSteps([
        "Access the device web interface",
        "Navigate to Settings > Security",
        "Change the default admin password",
        "Enable two-factor authentication if available",
        "Save changes and restart the device"
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { type: "user", text: userMessage }]);
    setChatInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/assistant/", {
        issue: userMessage
      });

      setChatMessages(prev => [
        ...prev,
        {
          type: "ai",
          text: response.data.suggestion,
          steps: response.data.steps
        }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [
        ...prev,
        {
          type: "ai",
          text: "I'm sorry, I couldn't process your request. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsFixed = async (vulnId) => {
    try {
      await axios.put(`http://localhost:8000/vulnerabilities/${vulnId}/status`, {
        status: "Fixed"
      });
      
      setVulnerabilities(prev => 
        prev.map(v => v.id === vulnId ? { ...v, status: "Fixed" } : v)
      );
    } catch (error) {
      console.error("Failed to mark as fixed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Fix Assistant</h1>
          <p className="text-gray-400">Get step-by-step guidance to fix security vulnerabilities</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-[#16243a] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("vulnerabilities")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "vulnerabilities" 
                ? "bg-teal-500 text-white" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaBug className="inline mr-2" />
            Vulnerabilities
          </button>
          <button
            onClick={() => setActiveTab("fixes")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "fixes" 
                ? "bg-teal-500 text-white" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaTools className="inline mr-2" />
            Fix Steps
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === "chat" 
                ? "bg-teal-500 text-white" 
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FaRobot className="inline mr-2" />
            AI Assistant
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Vulnerabilities List */}
          <div className="lg:col-span-1">
            <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Found Vulnerabilities</h2>
              
              <div className="space-y-3">
                {vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedVuln?.id === vuln.id 
                        ? "bg-teal-500 text-white" 
                        : "bg-[#22334d] hover:bg-[#2a3a5a]"
                    }`}
                    onClick={() => handleVulnerabilitySelect(vuln)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{vuln.device_name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(vuln.severity)}`}>
                        {vuln.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-1">{vuln.ip_address}</div>
                    <div className="text-sm mb-2">{vuln.vulnerability_type}</div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        vuln.status === "Fixed" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      }`}>
                        {vuln.status}
                      </span>
                      {vuln.status === "Open" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsFixed(vuln.id);
                          }}
                          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                        >
                          Mark Fixed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-2">
            {activeTab === "vulnerabilities" && (
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <div className="text-center py-12">
                  <FaShieldAlt className="text-gray-400 text-6xl mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select a Vulnerability</h3>
                  <p className="text-gray-400">Choose a vulnerability from the list to get detailed fix instructions</p>
                </div>
              </div>
            )}

            {activeTab === "fixes" && selectedVuln && (
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Fix Instructions</h2>
                  <div className="bg-[#22334d] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{selectedVuln.device_name}</div>
                        <div className="text-sm text-gray-400">{selectedVuln.ip_address}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(selectedVuln.severity)}`}>
                        {selectedVuln.severity} Risk
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">{selectedVuln.description}</div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner className="animate-spin text-teal-400 text-2xl mr-3" />
                    <span>Generating fix steps...</span>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Step-by-Step Fix Guide</h3>
                    <div className="space-y-3">
                      {fixSteps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-[#22334d] rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-white">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-green-900 bg-opacity-20 border border-green-500 rounded-lg">
                      <div className="flex items-center">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <span className="text-green-400 font-semibold">Security Best Practice</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-2">
                        After completing these steps, run another scan to verify the vulnerability has been resolved.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "chat" && (
              <div className="bg-[#16243a] rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">AI Security Assistant</h2>
                  <p className="text-gray-400">Ask questions about security vulnerabilities and get personalized guidance</p>
                </div>

                {/* Chat Messages */}
                <div className="bg-[#22334d] rounded-lg p-4 mb-4 min-h-[300px] max-h-[400px] overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <FaRobot className="text-4xl mx-auto mb-4" />
                      <p>Start a conversation to get security guidance</p>
                    </div>
                  )}
                  
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex mb-3 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 shadow ${
                        msg.type === "ai" ? "bg-[#16243a] text-white" : "bg-teal-400 text-white"
                      }`}>
                        <div className="flex items-center">
                          {msg.type === "ai" && <FaRobot className="text-teal-400 text-lg mr-2" />}
                          {msg.type === "user" && <FaUser className="text-white text-lg mr-2" />}
                          <span>{msg.text}</span>
                        </div>
                        {msg.steps && (
                          <div className="mt-2">
                            <ul className="list-disc pl-5 text-xs text-gray-200">
                              {msg.steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex justify-start mb-3">
                      <div className="bg-[#16243a] text-white rounded-lg px-4 py-2 shadow">
                        <div className="flex items-center">
                          <FaRobot className="text-teal-400 text-lg mr-2" />
                          <FaSpinner className="animate-spin text-teal-400 mr-2" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChatSubmit} className="flex items-center bg-[#22334d] rounded-lg px-3 py-2">
                  <input
                    type="text"
                    className="flex-1 bg-transparent text-white px-2 py-1 focus:outline-none"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about security vulnerabilities..."
                    disabled={loading}
                  />
                  <button type="submit" className="ml-2 text-teal-400 hover:text-teal-300 disabled:text-gray-500" disabled={loading}>
                    {loading ? <FaSpinner className="animate-spin text-xl" /> : <FaPaperPlane className="text-xl" />}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
