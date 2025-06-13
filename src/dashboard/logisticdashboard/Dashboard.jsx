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
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Logistic Dashboard</h2>

      {/* Logistic Info */}
      <div className="bg-gray-800 p-6 rounded-lg text-white space-y-2">
        <p>
          <strong>Full Name:</strong> {logisticInfo.fullName || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {logisticInfo.email || "N/A"}
        </p>
        <p>
          <strong>Phone:</strong> {logisticInfo.phone || "N/A"}
        </p>
        <p>
          <strong>Company:</strong> {logisticInfo.companyName || "N/A"}
        </p>
        <p>
          <strong>Address:</strong> {logisticInfo.address || "N/A"}
        </p>
        <p>
          <strong>Vehicle Type:</strong> {logisticInfo.vehicleType || "N/A"}
        </p>
        <p>
          <strong>Vehicle Capacity:</strong>{" "}
          {logisticInfo.vehicleCapacity || "N/A"}
        </p>
        <p>
          <strong>Years of Experience:</strong>{" "}
          {logisticInfo.yearsExperience || "N/A"}
        </p>
        <p>
          <strong>Service Areas:</strong> {logisticInfo.serviceAreas || "N/A"}
        </p>
        <p>
          <strong>Registered On:</strong>{" "}
          {logisticInfo.createdAt?.toDate
            ? logisticInfo.createdAt.toDate().toLocaleString()
            : "N/A"}
        </p>
      </div>

      {/* Counts */}
      <div className="flex flex-wrap gap-6">
        <div className="p-4 bg-blue-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Vehicles</p>
          <p className="text-2xl font-semibold">{fleet.length}</p>
        </div>
        <div className="p-4 bg-green-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Total Requests</p>
          <p className="text-2xl font-semibold">{requests.length}</p>
        </div>
        <div className="p-4 bg-yellow-600 text-white rounded-lg shadow w-48 text-center">
          <p className="text-lg">Pending Deliveries</p>
          <p className="text-2xl font-semibold">{pendingCount}</p>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">
          Total Capacity per Vehicle Type
        </h3>
        {chartData.length ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis
                label={{
                  value: "Total Capacity",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Bar dataKey="totalCapacity" name="Total Capacity">
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
          <p className="text-gray-400">No vehicle capacity data to display.</p>
        )}
      </div>
    </div>
  );
};

export default LDashboard;
