import React, { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Lock,
  Warehouse,
  Package,
  Thermometer,
  Calendar,
} from "lucide-react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const WarehouseSignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    warehouseName: "",
    capacity: "",
    climateControl: "",
    operationalSince: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const userCred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const warehouseid = userCred.user.uid;
      await setDoc(doc(db, "warehouse", warehouseid), {
        uid: userCred.user.uid,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        password: formData.password,
        warehouseName: formData.warehouseName,
        capacity: formData.capacity,
        climateControl: formData.climateControl,
        operationalSince: formData.operationalSince,
        createdAt: new Date(),
      });
      alert("Warehouse Owner registered successfully!");
      navigate(`/dashboard/warehouse/${warehouseid}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 py-8 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 opacity-10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-emerald-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Warehouse className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Join as a Warehouse Owner
            </h1>
            <p className="text-gray-600">
              Register your warehouse and connect with farmers and retailers
            </p>
          </div>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center mb-4">
                <User className="w-5 h-5 text-emerald-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    required
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    required
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    required
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-100">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-teal-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Account Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    required
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    required
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Warehouse Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <div className="flex items-center mb-4">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Warehouse Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    name="warehouseName"
                    value={formData.warehouseName}
                    required
                    onChange={handleChange}
                    placeholder="Enter warehouse name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Storage Capacity (tons) *
                  </label>
                  <input
                    type="text"
                    name="capacity"
                    value={formData.capacity}
                    required
                    onChange={handleChange}
                    placeholder="Enter capacity in tons"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Climate Control *
                  </label>
                  <select
                    name="climateControl"
                    value={formData.climateControl}
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">Select climate control</option>
                    <option value="Yes - Full Climate Control">
                      Yes - Full Climate Control
                    </option>
                    <option value="Yes - Temperature Control Only">
                      Yes - Temperature Control Only
                    </option>
                    <option value="Yes - Humidity Control Only">
                      Yes - Humidity Control Only
                    </option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Operational Since
                  </label>
                  <input
                    type="text"
                    name="operationalSince"
                    value={formData.operationalSince}
                    onChange={handleChange}
                    placeholder="e.g., 2020 or January 2020"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                  loading
                    ? "bg-emerald-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {loading && (
                  <svg
                    className="animate-spin w-6 h-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                )}
                {loading
                  ? "Creating Your Account..."
                  : "Create Warehouse Account"}
              </button>
            </div>

            {/* Footer Text */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{" "}
                <a
                  href="#"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 font-semibold"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseSignupForm;
