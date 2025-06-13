import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Bright, colorful palette
const COLORS = [
  "#FF6B6B", // red
  "#6BCB77", // green
  "#4D96FF", // blue
  "#FFD93D", // yellow
  "#FF9F1C", // orange
  "#9D4EDD", // purple
  "#00C49F", // teal
  "#E36414", // brownish orange
  "#F72585", // pink
  "#06D6A0", // mint
];

const Dashboard = () => {
  const { farmerId } = useParams();
  const [cropList, setCropList] = useState([]);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const cropsRef = collection(db, `farmer/${farmerId}/availableproducts`);
    const reqRef = collection(db, `farmer/${farmerId}/requests`);

    const unsubCrops = onSnapshot(cropsRef, (snap) =>
      setCropList(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    const unsubReqs = onSnapshot(reqRef, (snap) => setRequestCount(snap.size));

    return () => {
      unsubCrops();
      unsubReqs();
    };
  }, [farmerId]);

  const chartData = cropList.map((crop) => ({
    name: crop.name,
    quantity: Number(crop.quantity),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Farmer Dashboard</h2>

        <div className="flex flex-wrap gap-6">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg w-48 text-center backdrop-blur-sm border border-emerald-200 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <p className="text-lg font-semibold">Total Crops</p>
            <p className="text-2xl font-bold">{cropList.length}</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl shadow-lg w-48 text-center backdrop-blur-sm border border-teal-200 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <p className="text-lg font-semibold">Total Requests</p>
            <p className="text-2xl font-bold">{requestCount}</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Crop Quantity (kg)
          </h3>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Quantity (kg)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" name="Quantity (kg)">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No crops to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
