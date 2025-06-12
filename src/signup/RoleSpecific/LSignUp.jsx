import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LogisticsSignupForm = () => {
  const navigate = useNavigate();
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
        companyName: formData.companyName,
        vehicleTypes: formData.vehicleTypes,
        yearsExperience: formData.yearsExperience,
        serviceArea: formData.serviceArea,
        createdAt: new Date(),
      });
      alert("Logistics Provider registered successfully!");
      navigate(`/dashboard/logistic/${logisticid}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-white flex justify-center items-center py-10 px-4">
      <div className="bg-white w-full max-w-xl p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Register as Logistics Provider
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="text"
              name="phone"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Address *
            </label>
            <input
              type="text"
              name="address"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Vehicle Types *
            </label>
            <input
              type="text"
              name="vehicleTypes"
              required
              placeholder="e.g., Trucks, Vans, Bikes"
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Years of Experience
            </label>
            <input
              type="text"
              name="yearsExperience"
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Service Area *
            </label>
            <input
              type="text"
              name="serviceArea"
              required
              onChange={handleChange}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white font-semibold`}
          >
            {loading && (
              <svg
                className="animate-spin h-5 w-5 text-white"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LogisticsSignupForm;
