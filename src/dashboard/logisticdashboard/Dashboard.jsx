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
  "#10B981",
  "#0D9488",
  "#059669",
  "#065F46",
  "#047857",
  "#6EE7B7",
  "#34D399",
  "#A7F3D0",
  "#6366F1",
  "#8B5CF6",
];

const LDashboard = () => {
  const { logisticId } = useParams();
  const [logisticInfo, setLogisticInfo] = useState({});
  const [fleet, setFleet] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchInfo = async () => {
      const docRef = doc(db, `logistic/${logisticId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) setLogisticInfo(snap.data());
    };

    fetchInfo();

    const fleetRef = collection(db, `logistic/${logisticId}/fleets`);
    const requestsRef = collection(db, `logistic/${logisticId}/requests`);

    const unsubFleet = onSnapshot(fleetRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFleet(data);
    });

    const unsubRequests = onSnapshot(requestsRef, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setPendingCount(data.filter((r) => r.status === "pending").length);
    });

    return () => {
      unsubFleet();
      unsubRequests();
    };
  }, [logisticId]);

  const typeCapacityMap = {};
  fleet.forEach((vehicle) => {
    const type = vehicle.type || "Unknown";
    const capacity = Number(vehicle.capacity) || 0;
    if (!typeCapacityMap[type]) {
      typeCapacityMap[type] = 0;
    }
    typeCapacityMap[type] += capacity;
  });

  const chartData = Object.entries(typeCapacityMap).map(([type, total]) => ({
    type,
    totalCapacity: total,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-gray-800">Logistic Dashboard</h2>

        {/* Logistic Info */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 p-6 rounded-2xl shadow-2xl text-gray-800 space-y-2">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Company Information
            </h3>
          </div>
          <p className="text-gray-700">
            <strong className="text-gray-800">Full Name:</strong>{" "}
            {logisticInfo.fullName || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Email:</strong>{" "}
            {logisticInfo.email || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Phone:</strong>{" "}
            {logisticInfo.phone || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Company:</strong>{" "}
            {logisticInfo.companyName || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Address:</strong>{" "}
            {logisticInfo.address || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Vehicle Type:</strong>{" "}
            {logisticInfo.vehicleType || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Vehicle Capacity:</strong>{" "}
            {logisticInfo.vehicleCapacity || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Years of Experience:</strong>{" "}
            {logisticInfo.yearsExperience || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Service Areas:</strong>{" "}
            {logisticInfo.serviceAreas || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Registered On:</strong>{" "}
            {logisticInfo.createdAt?.toDate
              ? logisticInfo.createdAt.toDate().toLocaleString()
              : "N/A"}
          </p>
        </div>

        {/* Counts */}
        <div className="flex flex-wrap gap-6">
          <div className="p-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-2xl w-48 text-center hover:scale-105 transition-transform duration-200">
            <p className="text-lg font-semibold">Total Vehicles</p>
            <p className="text-3xl font-bold">{fleet.length}</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl shadow-2xl w-48 text-center hover:scale-105 transition-transform duration-200">
            <p className="text-lg font-semibold">Total Requests</p>
            <p className="text-3xl font-bold">{requests.length}</p>
          </div>
          <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-2xl w-48 text-center hover:scale-105 transition-transform duration-200">
            <p className="text-lg font-semibold">Pending Deliveries</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white/80 backdrop-blur-sm border border-teal-100 p-6 rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Total Capacity per Vehicle Type
            </h3>
          </div>
          {chartData.length ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#D1FAE5" />
                <XAxis dataKey="type" tick={{ fill: "#374151" }} />
                <YAxis
                  label={{
                    value: "Total Capacity",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fill: "#374151" },
                  }}
                  tick={{ fill: "#374151" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    border: "1px solid #A7F3D0",
                    borderRadius: "12px",
                    backdropFilter: "blur(4px)",
                  }}
                />
                <Bar
                  dataKey="totalCapacity"
                  name="Total Capacity"
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No vehicle capacity data to display.
              </p>
            </div>
          )}
        </div>

        {/* Decorative Background Elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 opacity-20 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default LDashboard;
