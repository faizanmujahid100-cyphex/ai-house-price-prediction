import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from 'sonner';
import { Navbar } from "../components/navbar";

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      let data = {};
      try { data = await res.json(); } catch { /* non-JSON response */ }

      if (!res.ok) {
        if (res.status === 404) { toast.error("Server error: auth route not found. Please restart the backend."); return; }
        toast.error(data.error || `Login failed (${res.status})`);
        return;
      }

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);

      toast.success("Logged in successfully!");
      setTimeout(() => navigate("/"), 800);
    } catch {
      toast.error("Cannot connect to server. Make sure the backend is running at http://localhost:7860");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
      <Toaster position="top-center" richColors />
      <Navbar />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center mt-20 mx-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
        <p className="text-gray-500 text-sm mb-6">Login to continue your analysis</p>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl text-lg font-medium transition mt-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-gray-500 text-sm text-center pt-2">
            Don't have an account?{' '}
            <span onClick={() => navigate("/sign_up")} className="text-emerald-600 font-semibold cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
