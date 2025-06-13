import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, collection, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#FF6B6B",
  "#6BCB77",
  "#4D96FF",
  "#FFD93D",
  "#FF9F1C",
  "#9D4EDD",
  "#00C49F",
  "#E36414",
  "#F72585",
  "#06D6A0",
];

const WDashboard = () => {
  const { warehouseId } = useParams();
  const [warehouseInfo, setWarehouseInfo] = useState({});
  const [requests, setRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [storageChartData, setStorageChartData] = useState([]);
  const [totalStorage, setTotalStorage] = useState(0);

  useEffect(() => {
    const fetchWarehouseInfo = async () => {
      const docRef = doc(db, `warehouse/${warehouseId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) setWarehouseInfo(snap.data());
    };

    const fetchStorageData = () => {
      const storageRef = collection(db, `warehouse/${warehouseId}/storages`);
      return onSnapshot(storageRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const chartMap = {};
        let total = 0;

        data.forEach((item) => {
          if (!item.type || !item.capacity) return;

          const typeRaw = item.type.trim().toLowerCase();
          const type = typeRaw.charAt(0).toUpperCase() + typeRaw.slice(1);

          const capacity = parseFloat(item.capacity) || 0;
          chartMap[type] = (chartMap[type] || 0) + capacity;
          total += capacity;
        });

        const chartArray = Object.keys(chartMap).map((type) => ({
          name: type,
          capacity: chartMap[type],
        }));

        setStorageChartData(chartArray);
        setTotalStorage(total);
      });
    };

    const fetchRequestsData = () => {
      const requestsRef = collection(db, `warehouse/${warehouseId}/requests`);
      return onSnapshot(requestsRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(data);
        setPendingCount(data.filter((r) => r.status === "pending").length);
      });
    };

    fetchWarehouseInfo();
    const unsubStorage = fetchStorageData();
    const unsubRequests = fetchRequestsData();

    return () => {
      unsubStorage();
      unsubRequests();
    };
  }, [warehouseId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Warehouse Dashboard
        </h2>

        {/* Warehouse Info */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-2xl p-6 text-gray-800 space-y-3">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Warehouse Name:</span>{" "}
            {warehouseInfo.warehouseName || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Email:</span>{" "}
            {warehouseInfo.email || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Phone:</span>{" "}
            {warehouseInfo.phone || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Address:</span>{" "}
            {warehouseInfo.address || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Location:</span>{" "}
            {warehouseInfo.location || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Goods Type:</span>{" "}
            {warehouseInfo.goodsType || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">
              Base Capacity (tons):
            </span>{" "}
            {warehouseInfo.capacity || "0"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">
              Years Operating:
            </span>{" "}
            {warehouseInfo.yearsOperating || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-800">Registered On:</span>{" "}
            {warehouseInfo.createdAt?.toDate
              ? warehouseInfo.createdAt.toDate().toLocaleString()
              : "N/A"}
          </p>
        </div>

        {/* Request Stats */}
        <div className="flex flex-wrap gap-6">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg w-48 text-center hover:scale-105 transition-all duration-200 transform">
            <p className="text-lg font-semibold">Total Requests</p>
            <p className="text-3xl font-bold">{requests.length}</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl shadow-lg w-48 text-center hover:scale-105 transition-all duration-200 transform">
            <p className="text-lg font-semibold">Pending Requests</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg w-48 text-center hover:scale-105 transition-all duration-200 transform">
            <p className="text-lg font-semibold">Total Capacity</p>
            <p className="text-3xl font-bold">
              {(parseFloat(warehouseInfo.capacity) || 0) + totalStorage}
            </p>
          </div>
        </div>

        {/* Storage Chart */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-2xl p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Storage Capacity by Type
          </h3>
          {storageChartData.length ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={storageChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Capacity (tons)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Bar dataKey="capacity" name="Capacity">
                  {storageChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No storage data to display.</p>
          )}
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-200 opacity-20 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
    </div>
  );
};

export default WDashboard;
