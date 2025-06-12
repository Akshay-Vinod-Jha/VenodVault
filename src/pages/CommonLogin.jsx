import React, { useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const CommonLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password || !role) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const q = query(
        collection(db, role),
        where("email", "==", email),
        where("password", "==", password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessage(`Login successful as ${role}`);
        setTimeout(() => {
          setLoading(false);
          navigate(`/dashboards/${role}dashboard`);
        }, 1000);
      } else {
        setMessage("Invalid credentials or role.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Error during login. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="farmer">Farmer</option>
          <option value="warehouse">Warehouse</option>
          <option value="logistic">Logistic</option>
          <option value="retailer">Retailer</option>
        </select>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 ${
            loading
              ? "bg-blue-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } p-3 rounded-lg font-semibold transition`}
        >
          {loading ? (
            <>
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {message && (
          <div className="mt-4 text-center text-sm text-yellow-400">
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          Don’t have an account?{" "}
          <button
            className="text-blue-400 hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonLogin;
