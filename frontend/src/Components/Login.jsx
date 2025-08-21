import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = e => {
    e.preventDefault();
    // TODO: Replace with real auth logic
    if (email && password) {
      setError("");
      navigate("/dashboard");
    } else {
      setError("Please enter both email and password.");
    }
  };

  const handleGoogleLogin = () => {
    // TODO: Add Google OAuth logic
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101c2a] font-sans">
      <div className="w-full max-w-md p-8 bg-[#16243a] rounded-2xl shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <span className="text-3xl font-bold text-teal-400">IoT SecScan</span>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-[#22334d] text-white focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-[#22334d] text-white focus:outline-none focus:ring-2 focus:ring-teal-400" />
          </div>
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-lg bg-teal-400 text-[#101c2a] font-bold text-lg shadow hover:bg-teal-500 transition">Login</button>
          <button type="button" onClick={handleGoogleLogin} className="w-full py-3 rounded-lg bg-white text-[#101c2a] font-bold text-lg shadow hover:bg-teal-200 transition flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none"><path d="M44.5 20H24V28.5H35.7C34.2 33.1 29.7 36 24 36C16.8 36 10.5 29.7 10.5 22.5C10.5 15.3 16.8 9 24 9C27.1 9 29.9 10.1 32.1 12L38.1 6C34.4 2.7 29.5 0.5 24 0.5C11.5 0.5 1 11 1 23.5C1 36 11.5 46.5 24 46.5C36.5 46.5 47 36 47 23.5C47 22.2 46.8 21.1 46.5 20Z" fill="#4285F4"/><path d="M6.3 14.7L13.1 19.7C15.1 15.7 19.2 13 24 13C27.1 13 29.9 14.1 32.1 16L38.1 10C34.4 6.7 29.5 4.5 24 4.5C16.8 4.5 10.5 10.8 10.5 18C10.5 20.2 11.1 22.3 12.1 24.1L6.3 14.7Z" fill="#34A853"/><path d="M24 44.5C29.7 44.5 34.2 41.6 35.7 37H24V28.5H44.5C44.8 29.6 45 30.7 45 32C45 39.2 38.7 44.5 31.5 44.5C27.1 44.5 23.1 42.2 20.7 38.7L13.1 43.3C16.8 46.6 21.7 48.5 27.1 48.5C36.5 48.5 47 38 47 25.5C47 24.2 46.8 23.1 46.5 22Z" fill="#FBBC05"/><path d="M6.3 33.3L13.1 28.3C15.1 32.3 19.2 35 24 35C27.1 35 29.9 33.9 32.1 32L38.1 38C34.4 41.3 29.5 43.5 24 43.5C16.8 43.5 10.5 37.2 10.5 30C10.5 27.8 11.1 25.7 12.1 23.9L6.3 33.3Z" fill="#EA4335"/></svg>
            Login with Google
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/forgot-password" className="text-teal-400 hover:underline">Forgot Password?</a>
        </div>
        <div className="mt-4 text-center text-gray-400">
          Don't have an account? <a href="/signup" className="text-teal-400 hover:underline">Sign up</a>
        </div>
      </div>
    </div>
  );
}
