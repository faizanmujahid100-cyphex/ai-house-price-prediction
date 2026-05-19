import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import { Navbar } from "../components/navbar";

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/accounts/login/",
        { username, password }
      );

      const avatarUrl = res.data.user?.avatar
        ? res.data.user.avatar.startsWith('http')
          ? res.data.user.avatar
          : `http://localhost:8000${res.data.user.avatar}`
        : "";

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("username", res.data.user?.username || "");
      localStorage.setItem("email", res.data.user?.email || "");
      localStorage.setItem("avatar", avatarUrl);

      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full font-poppins">
      <Toaster position="top-center" richColors />
      <Navbar />
      <div className="bg-white p-5 rounded-2xl shadow-xl w-110 text-center mt-20">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-1">Welcome</h2>
        <p className="text-gray-500 text-sm mb-3">
          Login to continue your analysis
        </p>
        <form onSubmit={handleSubmit} className="text-left">
          <div>
            <label className="font-medium text-gray-700">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
            />
          </div>
          <div>
            <label className="font-medium text-gray-700">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-3 mb-9 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl text-lg font-medium transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-gray-500 text-sm mt-5 text-center">
            Don't have an account?
            <span
              onClick={() => navigate("/sign_up")}
              className="text-emerald-600 font-semibold ml-1 cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
