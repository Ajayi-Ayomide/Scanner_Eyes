import React, { useState } from "react";
import axios from "axios";
import { FaSearch, FaLightbulb, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

export default function Suggestions() {
  const [keyword, setKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [severity, setSeverity] = useState("");

  const fetchSuggestions = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword");
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await axios.post("http://localhost:8000/suggestions/", {
        keyword: keyword.trim()
      });
      
      setSuggestions(response.data.suggestions || []);
      setSeverity(response.data.severity || "");
    } catch (err) {
      console.error("Suggestions error:", err);
      setError("Failed to fetch suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchSuggestions();
    }
  };

  const commonKeywords = [
    "RTSP", "FTP", "TELNET", "SSH", "DEFAULT", "PASSWORD", 
    "FIRMWARE", "UPDATE", "PORT", "OPEN", "WEAK"
  ];

  const handleKeywordClick = (kw) => {
    setKeyword(kw);
    setSuggestions([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#101c2a] text-white font-sans p-8">
      <h2 className="text-2xl font-bold mb-6">Security Suggestions</h2>
      
      <div className="bg-[#16243a] rounded-xl shadow p-6 mb-8">
        <div className="flex items-center mb-4">
          <FaLightbulb className="text-yellow-400 text-2xl mr-3" />
          <div>
            <div className="font-semibold text-lg">AI-Powered Security Suggestions</div>
            <div className="text-gray-400 text-sm">Get personalized security recommendations for your IoT devices</div>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter vulnerability keyword (e.g., RTSP, FTP, Default Credentials)"
              className="w-full bg-[#22334d] px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-400 pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg shadow flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <FaLightbulb />
                Get Suggestions
              </>
            )}
          </button>
        </div>

        {/* Common Keywords */}
        <div className="mb-6">
          <div className="text-sm text-gray-400 mb-3">Common vulnerability types:</div>
          <div className="flex flex-wrap gap-2">
            {commonKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => handleKeywordClick(kw)}
                className="px-3 py-1 bg-[#22334d] hover:bg-[#2a3a4d] text-gray-300 rounded-full text-sm transition"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Suggestions for "{keyword}"</span>
                {severity && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    severity === "Critical" ? "bg-red-600 text-white" :
                    severity === "High" ? "bg-orange-500 text-white" :
                    "bg-yellow-500 text-black"
                  }`}>
                    {severity} Priority
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-[#22334d] rounded-lg p-4 shadow hover:shadow-lg transition"
                >
                  <div className="flex items-start">
                    <div className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && suggestions.length === 0 && keyword && !error && (
          <div className="text-center py-8">
            <FaLightbulb className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-400">No suggestions found for "{keyword}". Try a different keyword.</p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-[#16243a] rounded-xl shadow p-6">
        <h3 className="font-semibold text-lg mb-4">How to use suggestions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#22334d] rounded-lg p-4">
            <div className="text-teal-400 font-semibold mb-2">1. Enter Keywords</div>
            <div className="text-gray-400 text-sm">Type vulnerability types like "RTSP", "FTP", or "Default Credentials"</div>
          </div>
          <div className="bg-[#22334d] rounded-lg p-4">
            <div className="text-teal-400 font-semibold mb-2">2. Get Suggestions</div>
            <div className="text-gray-400 text-sm">Receive AI-powered security recommendations and fixes</div>
          </div>
          <div className="bg-[#22334d] rounded-lg p-4">
            <div className="text-teal-400 font-semibold mb-2">3. Apply Fixes</div>
            <div className="text-gray-400 text-sm">Follow the step-by-step instructions to secure your devices</div>
          </div>
        </div>
      </div>
    </div>
  );
}
