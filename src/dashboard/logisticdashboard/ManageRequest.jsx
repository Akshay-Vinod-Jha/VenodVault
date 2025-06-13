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

const LManageRequest = () => {
  const { logisticId } = useParams();
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Validate logisticId parameter
  useEffect(() => {
    if (!logisticId) {
      setError("Logistic ID is required");
      setLoading(false);
    }
  }, [logisticId]);

  const formatTimestamp = useCallback((ts) => {
    if (!ts) return "N/A";

    try {
      // Handle Firestore Timestamp objects
      if (ts && typeof ts === "object" && ts.seconds !== undefined) {
        return new Date(ts.seconds * 1000).toLocaleString();
      }
      // Handle Date objects
      if (ts instanceof Date) {
        return ts.toLocaleString();
      }
      // Handle string or number timestamps
      if (typeof ts === "string" || typeof ts === "number") {
        const date = new Date(ts);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
      }
      // Handle any other object that might be a timestamp
      if (
        typeof ts === "object" &&
        ts.toDate &&
        typeof ts.toDate === "function"
      ) {
        return ts.toDate().toLocaleString();
      }
      return "N/A";
    } catch (error) {
      console.error("Error formatting timestamp:", error, ts);
      return "Invalid Date";
    }
  }, []);

  useEffect(() => {
    if (!logisticId) return;

    const unsubscribers = [];
    setError(null);

    // Helper function to create snapshot listener with error handling
    const createSnapshotListener = (collectionPath, setter, errorMessage) => {
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
            console.error(`Error processing ${errorMessage}:`, err);
            setError(`Failed to process ${errorMessage}`);
          }
        },
        (error) => {
          console.error(`Error fetching ${errorMessage}:`, error);
          setError(`Failed to fetch ${errorMessage}`);
        }
      );
    };

    try {
      // Pending requests listener
      const pendingUnsub = createSnapshotListener(
        `logistic/${logisticId}/requests`,
        setRequests,
        "pending requests"
      );

      // Accepted requests listener
      const acceptedUnsub = createSnapshotListener(
        `logistic/${logisticId}/incomingrequestaccept`,
        setAcceptedRequests,
        "accepted requests"
      );

      // Declined requests listener
      const declinedUnsub = createSnapshotListener(
        `logistic/${logisticId}/incomingrequestdecline`,
        setDeclinedRequests,
        "declined requests"
      );

      unsubscribers.push(pendingUnsub, acceptedUnsub, declinedUnsub);

      // Set loading to false after initial setup
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
  }, [logisticId]);

  const handleAccept = useCallback(
    async (request) => {
      if (!request?.docId || !request?.id) {
        alert("Invalid request data");
        return;
      }

      const batch = writeBatch(db);
      const requestRef = doc(
        db,
        `logistic/${logisticId}/requests`,
        request.docId
      );
      const acceptedRef = doc(
        db,
        `logistic/${logisticId}/incomingrequestaccept`,
        request.docId
      );
      const fleetRef = doc(db, `logistic/${logisticId}/fleets`, request.id);

      // Reference for the new RemainingPayments document
      const remainingPaymentsRef = doc(
        db,
        `${request.requestedByRole}/${request.requestedById}/RemainingPayments`,
        request.docId
      );

      setProcessingRequest(request.docId);

      try {
        // Check if fleet exists and has sufficient capacity
        const fleetDoc = await getDoc(fleetRef);

        if (!fleetDoc.exists()) {
          alert("Fleet not found!");
          return;
        }

        const fleetData = fleetDoc.data();
        const currentCapacity = parseInt(fleetData.capacity) || 0;
        const requestedQuantity = parseInt(request.requestedQuantity) || 0;

        if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
          alert("Invalid requested quantity");
          return;
        }

        if (currentCapacity < requestedQuantity) {
          alert(
            `Insufficient capacity! Available: ${currentCapacity}, Requested: ${requestedQuantity}`
          );
          return;
        }

        // Calculate cost to pay
        const costToPay = 1000 * requestedQuantity;

        // Use batch operations for consistency
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

        const newCapacity = currentCapacity - requestedQuantity;
        batch.update(fleetRef, {
          capacity: newCapacity.toString(),
          lastUpdated: new Date(),
        });

        // Add new document to RemainingPayments collection
        const remainingPaymentData = {
          requestId: request.docId,
          fleetId: request.id,
          requestedQuantity: requestedQuantity,
          costToPay: costToPay,
          vehicleNumber: request.vehicleNumber,
          driverName: request.driverName,
          fuelType: request.fuelType,
          type: request.type,
          requestedByRole: request.requestedByRole,
          requestedById: request.requestedById,
          logisticId: logisticId,
          paymentStatus: "pending",
          createdAt: new Date(),
          originalTimestamp: request.timestamp,
          originalAddedAt: request.addedAt,
        };

        batch.set(remainingPaymentsRef, remainingPaymentData);

        await batch.commit();
        console.log("Request accepted successfully and payment record created");
      } catch (err) {
        console.error("Error accepting request:", err);
        alert(`Failed to accept request: ${err.message || "Unknown error"}`);
      } finally {
        setProcessingRequest(null);
      }
    },
    [logisticId]
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
        `logistic/${logisticId}/requests`,
        request.docId
      );
      const rejectedRef = doc(
        db,
        `logistic/${logisticId}/incomingrequestdecline`,
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
    [logisticId]
  );

  const renderRequestCard = useCallback(
    (req, showActions = false) => {
      if (!req) return null;

      // Ensure all values are properly formatted before rendering
      const safeValue = (value) => {
        if (value === null || value === undefined) return "N/A";
        if (typeof value === "object" && value.seconds !== undefined) {
          return formatTimestamp(value);
        }
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      };

      return (
        <div
          key={req.docId}
          className={`p-6 rounded-2xl shadow-2xl transition-all duration-200 hover:scale-[1.02] ${
            req.status === "approved"
              ? "bg-white/80 backdrop-blur-sm border border-green-200"
              : req.status === "rejected"
              ? "bg-white/80 backdrop-blur-sm border border-red-200"
              : "bg-white/80 backdrop-blur-sm border border-emerald-100"
          }`}
        >
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-3 mb-4">
            <p className="text-sm text-emerald-700 font-mono break-all">
              <strong>Document ID:</strong> {safeValue(req.docId)}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4">
              <h1 className="text-xl font-bold text-gray-800 mb-3">
                Request Information
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                <p>
                  <strong className="text-gray-800">Fleet ID:</strong>{" "}
                  {safeValue(req.id)}
                </p>
                <p>
                  <strong className="text-gray-800">Requested Quantity:</strong>{" "}
                  {safeValue(req.requestedQuantity)}
                </p>
                <p>
                  <strong className="text-gray-800">Requested By Role:</strong>{" "}
                  {safeValue(req.requestedByRole)}
                </p>
                <p>
                  <strong className="text-gray-800">Vehicle Number:</strong>{" "}
                  {safeValue(req.vehicleNumber)}
                </p>
                <p>
                  <strong className="text-gray-800">Driver Name:</strong>{" "}
                  {safeValue(req.driverName)}
                </p>
                <p>
                  <strong className="text-gray-800">Fuel Type:</strong>{" "}
                  {safeValue(req.fuelType)}
                </p>
                <p>
                  <strong className="text-gray-800">Type:</strong>{" "}
                  {safeValue(req.type)}
                </p>
                <p>
                  <strong className="text-gray-800">Status:</strong>{" "}
                  <span
                    className={`font-bold px-2 py-1 rounded-full text-xs ${
                      req.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {safeValue(req.status)}
                  </span>
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200">
                <p className="text-gray-700 break-all">
                  <strong className="text-gray-800">Requested By ID:</strong>{" "}
                  {safeValue(req.requestedById)}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Timestamps</h3>
              <div className="space-y-1 text-gray-700">
                <p>
                  <strong className="text-gray-800">Timestamp:</strong>{" "}
                  {formatTimestamp(req.timestamp)}
                </p>
                <p>
                  <strong className="text-gray-800">Added At:</strong>{" "}
                  {formatTimestamp(req.addedAt)}
                </p>
                {req.processedAt && (
                  <p>
                    <strong className="text-gray-800">Processed At:</strong>{" "}
                    {formatTimestamp(req.processedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {showActions && req.status === "pending" && (
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => handleAccept(req)}
                disabled={processingRequest === req.docId}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                  processingRequest === req.docId
                    ? "bg-gray-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-100"
                }`}
              >
                {processingRequest === req.docId ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleReject(req)}
                disabled={processingRequest === req.docId}
                className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
                  processingRequest === req.docId
                    ? "bg-gray-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-100"
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8 flex items-center justify-center">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center max-w-md bg-white/80 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-red-600">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8 flex items-center justify-center">
        {/* Decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
        </div>

        <div className="text-center bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-8">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">
          Manage Requests
        </h2>

        <div className="flex space-x-2 mb-8 bg-white/80 backdrop-blur-sm border border-emerald-100 p-2 rounded-2xl shadow-2xl">
          {["pending", "accepted", "declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold capitalize transition-all duration-200 focus:outline-none focus:ring-4 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg focus:ring-emerald-100"
                  : "text-gray-700 hover:text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 focus:ring-emerald-100"
              }`}
            >
              {tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {getTabData.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-2xl">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-600 text-lg">
                No {activeTab} requests found.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {getTabData.map((req) =>
                renderRequestCard(req, activeTab === "pending")
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LManageRequest;
