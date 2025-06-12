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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Warehouse Dashboard</h2>

      {/* Warehouse Info */}
      <div className="bg-gray-800 p-6 rounded-lg text-white space-y-2">
        <p>
          <strong>Warehouse Name:</strong>{" "}
          {warehouseInfo.warehouseName || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {warehouseInfo.email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {warehouseInfo.phone || "N/A"}
        </p>
        <p>
          <strong>Address:</strong> {warehouseInfo.address || "N/A"}
        </p>
        <p>
          <strong>Location:</strong> {warehouseInfo.location || "N/A"}
        </p>
        <p>
          <strong>Goods Type:</strong> {warehouseInfo.goodsType || "N/A"}
        </p>
        <p>
          <strong>Base Capacity (tons):</strong> {warehouseInfo.capacity || "0"}
        </p>
        <p>
          <strong>Years Operating:</strong>{" "}
          {warehouseInfo.yearsOperating || "N/A"}
        </p>
        <p>
          <strong>Registered On:</strong>{" "}
          {warehouseInfo.createdAt?.toDate
            ? warehouseInfo.createdAt.toDate().toLocaleString()
            : "N/A"}
        </p>
      </div>

      {/* Request Stats */}
      <div className="flex flex-wrap gap-6">
        <div className="p-4 bg-blue-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Requests</p>
          <p className="text-2xl font-semibold">{requests.length}</p>
        </div>
        <div className="p-4 bg-yellow-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Pending Requests</p>
          <p className="text-2xl font-semibold">{pendingCount}</p>
        </div>
        <div className="p-4 bg-green-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Capacity</p>
          <p className="text-2xl font-semibold">
            {(parseFloat(warehouseInfo.capacity) || 0) + totalStorage}
          </p>
        </div>
      </div>

      {/* Storage Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">
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
          <p className="text-gray-400">No storage data to display.</p>
        )}
      </div>
    </div>
  );
};

export default WDashboard;
