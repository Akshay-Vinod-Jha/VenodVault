import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import navigate
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const FarmerSignupForm = () => {
  const navigate = useNavigate(); // ✅ Initialize navigate

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    farmName: "",
    cropTypes: "",
    yearsFarming: "",
    landSize: "",
    avgYield: "",
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

      const farmerId = userCred.user.uid;

      await setDoc(doc(db, "farmer", farmerId), {
        uid: farmerId,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        farmName: formData.farmName,
        cropTypes: formData.cropTypes,
        yearsFarming: formData.yearsFarming,
        landSize: formData.landSize,
        avgYield: formData.avgYield,
        createdAt: new Date(),
      });

      alert("Farmer registered successfully!");
      navigate(`/dashboard/farmer/${farmerId}`); // ✅ Navigate to dashboard
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
          Register as Farmer
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name *", name: "fullName", type: "text" },
            { label: "Phone Number *", name: "phone", type: "text" },
            { label: "Address *", name: "address", type: "text" },
            { label: "Email *", name: "email", type: "email" },
            { label: "Password *", name: "password", type: "password" },
            {
              label: "Confirm Password *",
              name: "confirmPassword",
              type: "password",
            },
            { label: "Farm Name *", name: "farmName", type: "text" },
            { label: "Types of Crops *", name: "cropTypes", type: "text" },
            { label: "Years in Farming", name: "yearsFarming", type: "number" },
            {
              label: "Land Size (acres/hectares)",
              name: "landSize",
              type: "text",
            },
            {
              label: "Average Yield per Season (kg)",
              name: "avgYield",
              type: "text",
            },
          ].map((field, index) => (
            <div key={index}>
              <label className="text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                required={field.label.includes("*")}
                onChange={handleChange}
                className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}

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

export default FarmerSignupForm;
