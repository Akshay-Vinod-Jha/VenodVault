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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Farmer Dashboard</h2>

      <div className="flex flex-wrap gap-6">
        <div className="p-4 bg-green-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Crops</p>
          <p className="text-2xl font-semibold">{cropList.length}</p>
        </div>
        <div className="p-4 bg-yellow-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Requests</p>
          <p className="text-2xl font-semibold">{requestCount}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Crop Quantity (kg)</h3>
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
          <p className="text-gray-500">No crops to display.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
