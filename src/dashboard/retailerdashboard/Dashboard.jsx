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

const RDashboard = () => {
  const { retailerId } = useParams();
  const [productList, setProductList] = useState([]);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    const productsRef = collection(
      db,
      `retailer/${retailerId}/availableProducts`
    );
    const requestsRef = collection(db, `retailer/${retailerId}/requests`);

    const unsubProducts = onSnapshot(productsRef, (snapshot) =>
      setProductList(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );

    const unsubRequests = onSnapshot(requestsRef, (snapshot) =>
      setRequestCount(snapshot.size)
    );

    return () => {
      unsubProducts();
      unsubRequests();
    };
  }, [retailerId]);

  const chartData = productList.map((product) => ({
    name: product.name,
    quantity: Number(product.quantity),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Retailer Dashboard</h2>

      <div className="flex flex-wrap gap-6">
        <div className="p-4 bg-blue-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Products</p>
          <p className="text-2xl font-semibold">{productList.length}</p>
        </div>
        <div className="p-4 bg-red-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Requests</p>
          <p className="text-2xl font-semibold">{requestCount}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Price in Ratio (0:1)</h3>
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
                  value: "Price (0-1)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" name="Product">
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
          <p className="text-gray-500">No products to display.</p>
        )}
      </div>
    </div>
  );
};

export default RDashboard;
