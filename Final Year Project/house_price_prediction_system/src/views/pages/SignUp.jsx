import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from 'sonner';
import { Navbar } from "../components/navbar";

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:7860';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) { toast.error("Passwords do not match!"); return; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.email)    { toast.error(`Email: ${data.email[0]}`); return; }
        if (data.username) { toast.error(`Username: ${data.username[0]}`); return; }
        toast.error(data.error || "Registration failed");
        return;
      }
      toast.success("Account created! Please login.");
      setTimeout(() => navigate("/sign_in"), 1000);
    } catch {
      toast.error("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50">
      <Toaster position="top-center" richColors />
      <Navbar />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center mt-10 mx-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
        <p className="text-gray-500 text-sm mb-6">Sign up to start predicting house prices</p>

        <form onSubmit={handleSubmit} className="text-left space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" placeholder="Choose a username" value={formData.username}
              onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="Enter email" value={formData.email}
              onChange={handleChange} required
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="Min 6 characters" value={formData.password}
              onChange={handleChange} required minLength={6}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" name="confirm_password" placeholder="Repeat password" value={formData.confirm_password}
              onChange={handleChange} required minLength={6}
              className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button type="submit" disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl text-lg font-medium transition mt-2 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"}`}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          <p className="text-gray-500 text-sm text-center pt-2">
            Already have an account?{' '}
            <span onClick={() => navigate("/sign_in")} className="text-emerald-600 font-semibold cursor-pointer hover:underline">Sign in</span>
          </p>
        </form>
      </div>
    </div>
  );
}
