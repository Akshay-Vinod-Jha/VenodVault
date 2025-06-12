import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

const ManageRequest = () => {
  const { farmerId } = useParams();
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [declinedRequests, setDeclinedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const unsubscribers = [];

    // Listen to pending requests
    const pendingUnsub = onSnapshot(
      collection(db, `farmer/${farmerId}/requests`),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching pending requests:", error);
        setLoading(false);
      }
    );

    // Listen to accepted requests
    const acceptedUnsub = onSnapshot(
      collection(db, `farmer/${farmerId}/incomingrequestaccept`),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
        setAcceptedRequests(data);
      },
      (error) => {
        console.error("Error fetching accepted requests:", error);
      }
    );

    // Listen to declined requests
    const declinedUnsub = onSnapshot(
      collection(db, `farmer/${farmerId}/incomingrequestdecline`),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          docId: docSnap.id,
          ...docSnap.data(),
        }));
        setDeclinedRequests(data);
      },
      (error) => {
        console.error("Error fetching declined requests:", error);
      }
    );

    unsubscribers.push(pendingUnsub, acceptedUnsub, declinedUnsub);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [farmerId]);

  const handleAccept = async (request) => {
    const requestRef = doc(db, `farmer/${farmerId}/requests`, request.docId);
    const acceptedRef = doc(
      db,
      `farmer/${farmerId}/incomingrequestaccept`,
      request.docId
    );
    const productRef = doc(
      db,
      `farmer/${farmerId}/availableproducts`,
      request.id
    );

    setProcessingRequest(request.docId);

    try {
      // 1. Get current product data
      const productDoc = await getDoc(productRef);

      if (!productDoc.exists()) {
        alert("Product not found!");
        return;
      }

      const productData = productDoc.data();
      const currentQuantity = parseInt(productData.quantity) || 0;
      const requestedQuantity = parseInt(request.requestedQuantity) || 0;

      // Check if enough quantity available
      if (currentQuantity < requestedQuantity) {
        alert(
          `Insufficient quantity! Available: ${currentQuantity}, Requested: ${requestedQuantity}`
        );
        return;
      }

      // 2. Update status in original request
      await updateDoc(requestRef, { status: "approved" });

      // 3. Copy to accept collection
      const updatedData = { ...request, status: "approved" };
      delete updatedData.docId;
      await setDoc(acceptedRef, updatedData);

      // 4. Update product quantity
      const newQuantity = currentQuantity - requestedQuantity;
      await updateDoc(productRef, {
        quantity: newQuantity.toString(),
      });

      console.log("Request accepted successfully");
      console.log(
        `Product quantity updated: ${currentQuantity} -> ${newQuantity}`
      );
    } catch (err) {
      console.error("Error accepting request:", err);
      alert("Failed to accept request. Please try again.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (request) => {
    const requestRef = doc(db, `farmer/${farmerId}/requests`, request.docId);
    const rejectedRef = doc(
      db,
      `farmer/${farmerId}/incomingrequestdecline`,
      request.docId
    );

    setProcessingRequest(request.docId);

    try {
      // 1. Update status in original request
      await updateDoc(requestRef, { status: "rejected" });

      // 2. Copy to decline collection
      const updatedData = { ...request, status: "rejected" };
      delete updatedData.docId;
      await setDoc(rejectedRef, updatedData);

      console.log("Request rejected successfully");
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request. Please try again.");
    } finally {
      setProcessingRequest(null);
    }
  };

  const renderRequestCard = (req, showActions = false) => (
    <div
      key={req.docId}
      className={`p-5 rounded-lg shadow-md ${
        req.status === "approved"
          ? "bg-green-800"
          : req.status === "rejected"
          ? "bg-red-800"
          : "bg-gray-800"
      }`}
    >
      {/* Document ID */}
      <p className="text-sm text-pink-400 font-mono break-all">
        Document ID: {req.docId}
      </p>

      <hr className="my-3 border-gray-600" />

      {/* Info */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-yellow-300">
          Request Information
        </h1>
        <p>
          <strong>Product ID:</strong> {req.id}
        </p>
        <p>
          <strong>Requested Quantity:</strong> {req.requestedQuantity}
        </p>
        <p>
          <strong>Requested By Role:</strong> {req.requestedByRole || "N/A"}
        </p>
        <p>
          <strong>Requested By ID:</strong>{" "}
          <span className="break-all">{req.requestedById}</span>
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`font-bold ${
              req.status === "pending"
                ? "text-yellow-400"
                : req.status === "approved"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {req.status}
          </span>
        </p>
        <p>
          <strong>Timestamp:</strong>{" "}
          {req.timestamp?.seconds
            ? new Date(req.timestamp.seconds * 1000).toLocaleString()
            : "N/A"}
        </p>
      </div>

      {/* Action Buttons */}
      {showActions && req.status === "pending" && (
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => handleAccept(req)}
            disabled={processingRequest === req.docId}
            className={`px-4 py-2 rounded-md text-white ${
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
            className={`px-4 py-2 rounded-md text-white ${
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

  const getTabData = () => {
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
  };

  const getTabCount = (tab) => {
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
  };

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
      <h2 className="text-2xl font-bold mb-6">Manage Requests</h2>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {["pending", "accepted", "declined"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {tab} ({getTabCount(tab)})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {getTabData().length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No {activeTab} requests found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {getTabData().map((req) =>
              renderRequestCard(req, activeTab === "pending")
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRequest;
