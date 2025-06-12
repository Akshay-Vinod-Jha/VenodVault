import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const WManageRequest = () => {
  const { warehouseId } = useParams();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, `warehouse/${warehouseId}/requests`),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(data);
      }
    );

    return () => unsub();
  }, [warehouseId]);

  const updateStatus = async (requestId, newStatus) => {
    try {
      const reqRef = doc(db, `warehouse/${warehouseId}/requests`, requestId);
      await updateDoc(reqRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating warehouse request status:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Manage Warehouse Requests
      </h2>

      {requests.length === 0 ? (
        <p className="text-gray-400">No warehouse requests available.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center"
            >
              <div className="text-white">
                <p>
                  <span className="font-semibold text-green-400">
                    Request #{req.id.slice(0, 6)}
                  </span>{" "}
                  by{" "}
                  <span className="text-yellow-400">
                    {req.requestedBy || "Unknown"}
                  </span>
                </p>
                <p className="text-sm mt-1 text-gray-300">
                  Storage Size:{" "}
                  <span className="text-white">
                    {req.storageSize || "N/A"} sq.ft
                  </span>{" "}
                  | Duration:{" "}
                  <span className="text-white">
                    {req.duration || "N/A"} days
                  </span>
                </p>
                <p className="text-sm mt-1 text-gray-400">
                  Location:{" "}
                  <span className="text-white">{req.location || "N/A"}</span>
                </p>
                <p className="text-sm mt-1 text-gray-400">
                  Status:{" "}
                  <span className="font-semibold capitalize">{req.status}</span>
                </p>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(req.id, "accepted")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, "rejected")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WManageRequest;
