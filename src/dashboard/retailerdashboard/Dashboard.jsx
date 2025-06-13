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
import {
  Package,
  FileText,
  TrendingUp,
  BarChart3,
  Store,
  Activity,
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Retailer Dashboard
              </h2>
              <p className="text-gray-600">
                Monitor your inventory and business performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Products Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Total Products
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {productList.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">Items in inventory</p>
              </div>
              <div className="text-right">
                <div className="text-emerald-600">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Requests Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-teal-100 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Total Requests
                  </p>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {requestCount}
                </p>
                <p className="text-sm text-gray-600 mt-1">Pending orders</p>
              </div>
              <div className="text-right">
                <div className="text-teal-600">
                  <Store className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-green-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Product Quantity Analysis
              </h3>
              <p className="text-gray-600">
                Inventory levels across all products
              </p>
            </div>
          </div>

          {chartData.length ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#374151", fontSize: 12 }}
                    axisLine={{ stroke: "#9ca3af" }}
                    tickLine={{ stroke: "#9ca3af" }}
                  />
                  <YAxis
                    label={{
                      value: "Quantity",
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: "#374151" },
                    }}
                    tick={{ fill: "#374151", fontSize: 12 }}
                    axisLine={{ stroke: "#9ca3af" }}
                    tickLine={{ stroke: "#9ca3af" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="quantity"
                    name="Product Quantity"
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-8">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  No products to display
                </p>
                <p className="text-gray-400">
                  Add products to your inventory to see the analysis
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RDashboard;
