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
    const paymentRef = doc(
      db,
      `${request.requestedByRole}/${request.requestedById}/RemainingPayments`,
      request.docId
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
      const sellingPrice = parseFloat(productData.sellingPrice) || 0;

      // Check if enough quantity available
      if (currentQuantity < requestedQuantity) {
        alert(
          `Insufficient quantity! Available: ${currentQuantity}, Requested: ${requestedQuantity}`
        );
        return;
      }

      // Calculate cost to pay
      const costToPay = sellingPrice * requestedQuantity;

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

      // 5. Create payment document in requester's RemainingPayments collection
      const paymentData = {
        productId: request.id,
        productName: productData.productName || "N/A",
        farmerId: farmerId,
        farmerName: productData.farmerName || "N/A",
        requestedQuantity: requestedQuantity,
        sellingPrice: sellingPrice,
        costToPay: costToPay,
        requestDocId: request.docId,
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: new Date(),
        requestedByRole: request.requestedByRole,
        requestedById: request.requestedById,
        timestamp: request.timestamp,
      };

      await setDoc(paymentRef, paymentData);

      console.log("Request accepted successfully");
      console.log(
        `Product quantity updated: ${currentQuantity} -> ${newQuantity}`
      );
      console.log(`Payment document created with cost: ${costToPay}`);
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
      className={`p-6 rounded-xl shadow-lg backdrop-blur-sm border-2 transition-all duration-200 ${
        req.status === "approved"
          ? "bg-green-50/80 border-green-200"
          : req.status === "rejected"
          ? "bg-red-50/80 border-red-200"
          : "bg-white/80 border-emerald-100"
      }`}
    >
      {/* Document ID */}
      <p className="text-sm text-emerald-600 font-mono break-all font-semibold">
        Document ID: {req.docId}
      </p>

      <hr className="my-4 border-emerald-100" />

      {/* Info */}
      <div className="space-y-3">
        <h1 className="text-xl font-bold text-gray-800">Request Information</h1>
        <div className="space-y-2">
          <p className="text-gray-700">
            <strong className="text-gray-800">Product ID:</strong> {req.id}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Requested Quantity:</strong>{" "}
            {req.requestedQuantity}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Requested By Role:</strong>{" "}
            {req.requestedByRole || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Requested By ID:</strong>{" "}
            <span className="break-all">{req.requestedById}</span>
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Status:</strong>{" "}
            <span
              className={`font-bold ${
                req.status === "pending"
                  ? "text-emerald-600"
                  : req.status === "approved"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {req.status}
            </span>
          </p>
          <p className="text-gray-700">
            <strong className="text-gray-800">Timestamp:</strong>{" "}
            {req.timestamp?.seconds
              ? new Date(req.timestamp.seconds * 1000).toLocaleString()
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && req.status === "pending" && (
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => handleAccept(req)}
            disabled={processingRequest === req.docId}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition-all duration-200 transform ${
              processingRequest === req.docId
                ? "bg-gray-400 cursor-not-allowed scale-95"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 hover:shadow-lg"
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
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-lg"
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
      <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-200 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Manage Requests
        </h2>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-emerald-100">
          {["pending", "accepted", "declined"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-emerald-50"
              }`}
            >
              {tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {getTabData().length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-emerald-100 shadow-lg">
                <p className="text-gray-600 text-lg">
                  No {activeTab} requests found.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {getTabData().map((req) =>
                renderRequestCard(req, activeTab === "pending")
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageRequest;
