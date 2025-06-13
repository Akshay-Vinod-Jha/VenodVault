import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../firebase";

const WManageRequest = () => {
  const { warehouseId } = useParams();
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!warehouseId) {
      setError("Warehouse ID is required");
      setLoading(false);
    }
  }, [warehouseId]);

  const formatTimestamp = useCallback((ts) => {
    if (!ts) return "N/A";
    try {
      if (ts?.seconds !== undefined)
        return new Date(ts.seconds * 1000).toLocaleString();
      if (ts instanceof Date) return ts.toLocaleString();
      if (typeof ts === "string" || typeof ts === "number") {
        const date = new Date(ts);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
      }
      if (ts?.toDate && typeof ts.toDate === "function")
        return ts.toDate().toLocaleString();
      return "N/A";
    } catch (error) {
      console.error("Error formatting timestamp:", error, ts);
      return "Invalid Date";
    }
  }, []);

  useEffect(() => {
    if (!warehouseId) return;

    const unsubscribers = [];
    setError(null);

    const createSnapshotListener = (collectionPath, setter, label) => {
      return onSnapshot(
        collection(db, collectionPath),
        (snapshot) => {
          try {
            const data = snapshot.docs.map((docSnap) => ({
              docId: docSnap.id,
              ...docSnap.data(),
            }));
            setter(data);
          } catch (err) {
            console.error(`Error processing ${label}:`, err);
            setError(`Failed to process ${label}`);
          }
        },
        (error) => {
          console.error(`Error fetching ${label}:`, error);
          setError(`Failed to fetch ${label}`);
        }
      );
    };

    try {
      const pendingUnsub = createSnapshotListener(
        `warehouse/${warehouseId}/requests`,
        setRequests,
        "pending requests"
      );
      const acceptedUnsub = createSnapshotListener(
        `warehouse/${warehouseId}/incomingrequestaccept`,
        setAcceptedRequests,
        "accepted requests"
      );
      const declinedUnsub = createSnapshotListener(
        `warehouse/${warehouseId}/incomingrequestdecline`,
        setDeclinedRequests,
        "declined requests"
      );

      unsubscribers.push(pendingUnsub, acceptedUnsub, declinedUnsub);
      setLoading(false);
    } catch (err) {
      console.error("Error setting up listeners:", err);
      setError("Failed to initialize request monitoring");
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      });
    };
  }, [warehouseId]);

  const handleAccept = useCallback(
    async (request) => {
      if (!request?.docId || !request?.id) {
        alert("Invalid request data");
        return;
      }

      const batch = writeBatch(db);
      const requestRef = doc(
        db,
        `warehouse/${warehouseId}/requests`,
        request.docId
      );
      const acceptedRef = doc(
        db,
        `warehouse/${warehouseId}/incomingrequestaccept`,
        request.docId
      );
      const storageRef = doc(
        db,
        `warehouse/${warehouseId}/storages`,
        request.id
      );

      setProcessingRequest(request.docId);

      try {
        const storageDoc = await getDoc(storageRef);
        if (!storageDoc.exists()) {
          alert("Storage item not found!");
          return;
        }

        const storageData = storageDoc.data();
        const currentQty = parseInt(storageData.capacity) || 0;
        const requestedQty = parseInt(request.requestedQuantity) || 0;

        if (currentQty < requestedQty) {
          alert(
            `Insufficient capacity! Available: ${currentQty}, Requested: ${requestedQty}`
          );
          return;
        }

        batch.update(requestRef, {
          status: "approved",
          processedAt: new Date(),
        });

        const updatedData = {
          ...request,
          status: "approved",
          processedAt: new Date(),
        };
        delete updatedData.docId;
        batch.set(acceptedRef, updatedData);

        const newQty = currentQty - requestedQty;
        batch.update(storageRef, {
          capacity: newQty.toString(),
          lastUpdated: new Date(),
        });

        await batch.commit();
        console.log("Request accepted successfully");
      } catch (err) {
        console.error("Error accepting request:", err);
        alert(`Failed to accept request: ${err.message || "Unknown error"}`);
      } finally {
        setProcessingRequest(null);
      }
    },
    [warehouseId]
  );

  const handleReject = useCallback(
    async (request) => {
      if (!request?.docId) {
        alert("Invalid request data");
        return;
      }

      const batch = writeBatch(db);
      const requestRef = doc(
        db,
        `warehouse/${warehouseId}/requests`,
        request.docId
      );
      const rejectedRef = doc(
        db,
        `warehouse/${warehouseId}/incomingrequestdecline`,
        request.docId
      );

      setProcessingRequest(request.docId);

      try {
        batch.update(requestRef, {
          status: "rejected",
          processedAt: new Date(),
        });

        const updatedData = {
          ...request,
          status: "rejected",
          processedAt: new Date(),
        };
        delete updatedData.docId;
        batch.set(rejectedRef, updatedData);

        await batch.commit();
        console.log("Request rejected successfully");
      } catch (err) {
        console.error("Error rejecting request:", err);
        alert(`Failed to reject request: ${err.message || "Unknown error"}`);
      } finally {
        setProcessingRequest(null);
      }
    },
    [warehouseId]
  );

  const renderRequestCard = useCallback(
    (req, showActions = false) => {
      if (!req) return null;

      const safeValue = (value) => {
        if (value === null || value === undefined) return "N/A";
        if (typeof value === "object" && value.seconds !== undefined)
          return formatTimestamp(value);
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      };

      return (
        <div
          key={req.docId}
          className={`p-6 rounded-xl shadow-lg transition-all duration-200 border-2 ${
            req.status === "approved"
              ? "bg-white/80 backdrop-blur-sm border-emerald-100"
              : req.status === "rejected"
              ? "bg-white/80 backdrop-blur-sm border-red-100"
              : "bg-white/80 backdrop-blur-sm border-teal-100"
          }`}
        >
          <p className="text-sm text-emerald-600 font-semibold break-all">
            Document ID: {safeValue(req.docId)}
          </p>
          <hr className="my-3 border-gray-200" />

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-gray-800">
              Storage Request Info
            </h1>
            <p className="text-gray-700">
              <strong className="text-gray-800">Storage ID:</strong>{" "}
              {safeValue(req.id)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Location:</strong>{" "}
              {safeValue(req.location)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Type:</strong>{" "}
              {safeValue(req.type)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Price Per Day:</strong>{" "}
              {safeValue(req.pricePerDay)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Storage Name:</strong>{" "}
              {safeValue(req.storageName)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Requested Quantity:</strong>{" "}
              {safeValue(req.requestedQuantity)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Requested By:</strong>{" "}
              {safeValue(req.requestedById)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Role:</strong>{" "}
              {safeValue(req.requestedByRole)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Status:</strong>
              <span
                className={`font-semibold ml-1 ${
                  req.status === "pending"
                    ? "text-yellow-600"
                    : req.status === "approved"
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {safeValue(req.status)}
              </span>
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Created At:</strong>{" "}
              {formatTimestamp(req.createdAt)}
            </p>
            <p className="text-gray-700">
              <strong className="text-gray-800">Timestamp:</strong>{" "}
              {formatTimestamp(req.timestamp)}
            </p>
            {req.processedAt && (
              <p className="text-gray-700">
                <strong className="text-gray-800">Processed At:</strong>{" "}
                {formatTimestamp(req.processedAt)}
              </p>
            )}
          </div>

          {showActions && req.status === "pending" && (
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => handleAccept(req)}
                disabled={processingRequest === req.docId}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                  processingRequest === req.docId
                    ? "bg-emerald-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {processingRequest === req.docId ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleReject(req)}
                disabled={processingRequest === req.docId}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                  processingRequest === req.docId
                    ? "bg-red-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {processingRequest === req.docId ? "Processing..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      );
    },
    [formatTimestamp, handleAccept, handleReject, processingRequest]
  );

  const getTabData = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return requests.filter((req) => req.status === "pending");
      case "accepted":
        return acceptedRequests;
      case "declined":
        return declinedRequests;
      default:
        return [];
    }
  }, [activeTab, requests, acceptedRequests, declinedRequests]);

  const getTabCount = useCallback(
    (tab) => {
      switch (tab) {
        case "pending":
          return requests.filter((req) => req.status === "pending").length;
        case "accepted":
          return acceptedRequests.length;
        case "declined":
          return declinedRequests.length;
        default:
          return 0;
      }
    },
    [requests, acceptedRequests, declinedRequests]
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-red-100 p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-emerald-100 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 opacity-20 blur-3xl rounded-full transform -translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-emerald-100 p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            Manage Warehouse Requests
          </h2>

          <div className="flex space-x-1 mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-1 rounded-xl border border-emerald-100">
            {["pending", "accepted", "declined"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold capitalize transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                {tab} ({getTabCount(tab)})
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {getTabData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <p className="text-gray-600 text-lg">
                  No {activeTab} requests found.
                </p>
              </div>
            ) : (
              getTabData.map((req) =>
                renderRequestCard(req, activeTab === "pending")
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WManageRequest;
