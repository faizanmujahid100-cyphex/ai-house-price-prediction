import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from 'sonner';
import { Navbar } from "../components/navbar";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/accounts/register/",
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      toast.success("Account created successfully! Please login.");
      navigate("/sign_in");
    } catch (error) {
      const data = error.response?.data;
      if (data?.email) toast.error(`Email: ${data.email[0]}`);
      else if (data?.username) toast.error(`Username: ${data.username[0]}`);
      else if (data?.password) toast.error(`Password: ${data.password[0]}`);
      else toast.error("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full font-poppins">
      <Toaster position="top-center" richColors />
      <Navbar />
      <div className="bg-white p-5 rounded-2xl shadow-xl w-110 text-center mt-10">
        <h2 className="text-2xl font-semibold text-emerald-600 mb-1">Create Account</h2>
        <p className="text-gray-500 text-sm mb-3">
          Sign up to start predicting house prices
        </p>
        <form onSubmit={handleSubmit} className="text-left">
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
          />
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full mt-3 mb-3 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full mt-3 mb-9 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 caret-emerald-400"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 text-white py-3 rounded-xl text-lg font-medium transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-700"
            }`}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-gray-500 text-sm mt-5 text-center">
            Already have an account?
            <span
              onClick={() => navigate("/sign_in")}
              className="text-emerald-600 font-semibold ml-1 cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
