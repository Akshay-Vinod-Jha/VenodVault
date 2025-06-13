import React, { useState } from "react";
import { Truck, User, MapPin, Building, Calendar, Shield } from "lucide-react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LogisticsSignupForm = () => {
  const navigate = useNavigate(); // Uncomment in your project
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    vehicleTypes: "",
    yearsExperience: "",
    serviceArea: "",
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
      const logisticid = userCred.user.uid;
      await setDoc(doc(db, "logistic", logisticid), {
        uid: userCred.user.uid,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        vehicleTypes: formData.vehicleTypes,
        yearsExperience: formData.yearsExperience,
        serviceArea: formData.serviceArea,
        createdAt: new Date(),
      });
      alert("Logistics Provider registered successfully!");
      navigate(`/dashboard/logistic/${logisticid}`); // Uncomment in your project
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex justify-center items-center py-10 px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full transform translate-x-16 -translate-y-8"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-200 opacity-20 blur-3xl rounded-full transform -translate-x-12 translate-y-8"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="bg-white/80 backdrop-blur-sm w-full max-w-4xl p-8 rounded-2xl shadow-2xl border border-emerald-100 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Truck className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Join Our Logistics Network
          </h2>
          <p className="text-gray-600">
            Register as a professional logistics provider and expand your
            business reach
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter your complete address"
                />
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-100">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-teal-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Account Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Create a strong password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          </div>

          {/* Business Information Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
            <div className="flex items-center mb-4">
              <Building className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Business Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Types *
                </label>
                <input
                  type="text"
                  name="vehicleTypes"
                  required
                  value={formData.vehicleTypes}
                  onChange={handleChange}
                  placeholder="e.g., Trucks, Vans, Bikes"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="text"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter years of experience"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Area *
                </label>
                <input
                  type="text"
                  name="serviceArea"
                  required
                  value={formData.serviceArea}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="Enter your service area"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
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
            {loading ? "Creating Your Account..." : "Create Logistics Account"}
          </button>

          {/* Footer */}
          <div className="text-center text-gray-600 text-sm">
            Already have an account?{" "}
            <a
              href="#"
              className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200 font-semibold"
            >
              Sign in here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogisticsSignupForm;
