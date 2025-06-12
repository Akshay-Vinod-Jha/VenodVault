import React from "react";
import { useNavigate } from "react-router-dom";

const EntrySignUp = () => {
  const navigate = useNavigate();

  const handleNavigate = (role) => {
    navigate(`/signup/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Sign Up with</h2>

        <div className="space-y-4">
          <button
            onClick={() => handleNavigate("farmer")}
            className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg font-semibold transition"
          >
            Farmer
          </button>

          <button
            onClick={() => handleNavigate("warehouse")}
            className="w-full bg-yellow-600 hover:bg-yellow-700 p-3 rounded-lg font-semibold transition"
          >
            Warehouse
          </button>

          <button
            onClick={() => handleNavigate("logistic")}
            className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold transition"
          >
            Logistic
          </button>

          <button
            onClick={() => handleNavigate("retailer")}
            className="w-full bg-purple-600 hover:bg-purple-700 p-3 rounded-lg font-semibold transition"
          >
            Retailer
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntrySignUp;
