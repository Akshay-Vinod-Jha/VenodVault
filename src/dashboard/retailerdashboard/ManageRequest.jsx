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

const RManageRequest = () => {
  const { retailerId } = useParams();
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!retailerId) {
      setError("Retailer ID is required");
      setLoading(false);
    }
  }, [retailerId]);

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
    if (!retailerId) return;

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
        `retailer/${retailerId}/requests`,
        setRequests,
        "pending requests"
      );
      const acceptedUnsub = createSnapshotListener(
        `retailer/${retailerId}/incomingrequestaccept`,
        setAcceptedRequests,
        "accepted requests"
      );
      const declinedUnsub = createSnapshotListener(
        `retailer/${retailerId}/incomingrequestdecline`,
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
  }, [retailerId]);

  const handleAccept = useCallback(
    async (request) => {
      if (!request?.docId || !request?.id) {
        alert("Invalid request data");
        return;
      }

      const batch = writeBatch(db);
      const requestRef = doc(
        db,
        `retailer/${retailerId}/requests`,
        request.docId
      );
      const acceptedRef = doc(
        db,
        `retailer/${retailerId}/incomingrequestaccept`,
        request.docId
      );
      const productRef = doc(
        db,
        `retailer/${retailerId}/availableProducts`,
        request.id
      );

      setProcessingRequest(request.docId);

      try {
        const productDoc = await getDoc(productRef);
        if (!productDoc.exists()) {
          alert("Product not found!");
          return;
        }

        const productData = productDoc.data();
        const currentQty = parseInt(productData.quantity) || 0;
        const requestedQty = parseInt(request.requestedQuantity) || 0;

        if (currentQty < requestedQty) {
          alert(
            `Insufficient quantity! Available: ${currentQty}, Requested: ${requestedQty}`
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
        batch.update(productRef, {
          quantity: newQty.toString(),
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
    [retailerId]
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
        `retailer/${retailerId}/requests`,
        request.docId
      );
      const rejectedRef = doc(
        db,
        `retailer/${retailerId}/incomingrequestdecline`,
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
    [retailerId]
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

      const getStatusColor = (status) => {
        switch (status) {
          case "approved":
            return "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50";
          case "rejected":
            return "border-red-200 bg-gradient-to-r from-red-50 to-pink-50";
          default:
            return "border-gray-200 bg-white";
        }
      };

      const getStatusBadge = (status) => {
        switch (status) {
          case "approved":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
          case "rejected":
            return "bg-red-100 text-red-800 border-red-200";
          case "pending":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
          default:
            return "bg-gray-100 text-gray-800 border-gray-200";
        }
      };

      return (
        <div
          key={req.docId}
          className={`p-6 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${getStatusColor(
            req.status
          )}`}
        >
          {/* Header with status badge */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium mb-2">
                Document ID: {safeValue(req.docId)}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border capitalize ${getStatusBadge(
                req.status
              )}`}
            >
              {safeValue(req.status)}
            </span>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Product Information */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Product Request
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Product Name
                  </label>
                  <p className="text-gray-800 font-medium">
                    {safeValue(req.name)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Brand
                  </label>
                  <p className="text-gray-800">{safeValue(req.brand)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Selling Price
                  </label>
                  <p className="text-gray-800 font-medium">
                    ₹{safeValue(req.sellingPrice)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Requested Quantity
                  </label>
                  <p className="text-gray-800 font-bold text-lg text-emerald-600">
                    {safeValue(req.requestedQuantity)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Requested By
                  </label>
                  <p className="text-gray-800">
                    {safeValue(req.requestedById)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Role
                  </label>
                  <p className="text-gray-800 capitalize">
                    {safeValue(req.requestedByRole)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Product ID
                  </label>
                  <p className="text-gray-800 font-mono text-sm break-all">
                    {safeValue(req.id)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    Expiry Date
                  </label>
                  <p className="text-gray-800">{safeValue(req.expiryDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Timeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Added At:</span>
                <p className="text-gray-800 font-medium">
                  {formatTimestamp(req.addedAt)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Timestamp:</span>
                <p className="text-gray-800 font-medium">
                  {formatTimestamp(req.timestamp)}
                </p>
              </div>
              {req.processedAt && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">Processed At:</span>
                  <p className="text-gray-800 font-medium">
                    {formatTimestamp(req.processedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && req.status === "pending" && (
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => handleAccept(req)}
                disabled={processingRequest === req.docId}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                  processingRequest === req.docId
                    ? "bg-emerald-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {processingRequest === req.docId ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Accept
                  </div>
                )}
              </button>
              <button
                onClick={() => handleReject(req)}
                disabled={processingRequest === req.docId}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                  processingRequest === req.docId
                    ? "bg-red-400 cursor-not-allowed scale-95"
                    : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:scale-105 hover:shadow-lg"
                }`}
              >
                {processingRequest === req.docId ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Reject
                  </div>
                )}
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
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.317 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Error Occurred
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-6">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading Requests
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-8 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mr-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Manage Retailer Requests
              </h1>
              <p className="text-gray-600">
                Review and process product requests from retailers
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-2 mb-8">
          <div className="flex space-x-1">
            {[
              { key: "pending", label: "Pending", icon: "⏳" },
              { key: "accepted", label: "Accepted", icon: "✅" },
              { key: "declined", label: "Declined", icon: "❌" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-100 ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className="mr-2">{tab.icon}</span>
                  <span className="capitalize">{tab.label}</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {getTabCount(tab.key)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {getTabData.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No {activeTab} requests found
              </h3>
              <p className="text-gray-600">
                There are currently no {activeTab} requests to display.
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

export default RManageRequest;
