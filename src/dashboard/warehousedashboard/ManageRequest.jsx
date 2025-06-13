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
          className={`p-5 rounded-lg shadow-md transition-colors ${
            req.status === "approved"
              ? "bg-green-800"
              : req.status === "rejected"
              ? "bg-red-800"
              : "bg-gray-800"
          }`}
        >
          <p className="text-sm text-pink-400 font-mono break-all">
            Document ID: {safeValue(req.docId)}
          </p>
          <hr className="my-3 border-gray-600" />

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-yellow-300">
              Storage Request Info
            </h1>
            <p>
              <strong>Storage ID:</strong> {safeValue(req.id)}
            </p>
            <p>
              <strong>Location:</strong> {safeValue(req.location)}
            </p>
            <p>
              <strong>Type:</strong> {safeValue(req.type)}
            </p>
            <p>
              <strong>Price Per Day:</strong> {safeValue(req.pricePerDay)}
            </p>
            <p>
              <strong>Storage Name:</strong> {safeValue(req.storageName)}
            </p>
            <p>
              <strong>Requested Quantity:</strong>{" "}
              {safeValue(req.requestedQuantity)}
            </p>
            <p>
              <strong>Requested By:</strong> {safeValue(req.requestedById)}
            </p>
            <p>
              <strong>Role:</strong> {safeValue(req.requestedByRole)}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`font-bold ${
                  req.status === "pending"
                    ? "text-yellow-400"
                    : req.status === "approved"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {safeValue(req.status)}
              </span>
            </p>
            <p>
              <strong>Created At:</strong> {formatTimestamp(req.createdAt)}
            </p>
            <p>
              <strong>Timestamp:</strong> {formatTimestamp(req.timestamp)}
            </p>
            {req.processedAt && (
              <p>
                <strong>Processed At:</strong>{" "}
                {formatTimestamp(req.processedAt)}
              </p>
            )}
          </div>

          {showActions && req.status === "pending" && (
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => handleAccept(req)}
                disabled={processingRequest === req.docId}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  processingRequest === req.docId
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {processingRequest === req.docId ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleReject(req)}
                disabled={processingRequest === req.docId}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  processingRequest === req.docId
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
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
      <div className="p-6 text-white min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-red-400">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-white min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-white min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Manage Warehouse Requests</h2>

        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
          {["pending", "accepted", "declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {getTabData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-6xl mb-4">📋</div>
              <p className="text-gray-400 text-lg">
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
  );
};

export default WManageRequest;
