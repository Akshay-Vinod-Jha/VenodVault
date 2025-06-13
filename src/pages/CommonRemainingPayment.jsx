import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";

// Razorpay configuration
const RAZORPAY_KEY_ID = "rzp_test_dv1c1jYE7Puoaa";

const CommonRemainingPayment = () => {
  const { farmerId, retailerId, logisticId, warehouseId } = useParams();
  const location = useLocation();
  const [remainingPayments, setRemainingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingDocuments, setPayingDocuments] = useState(new Set());

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Determine the role and user ID from the URL
  const getUserRoleAndId = () => {
    const pathSegments = location.pathname.split("/");
    const role = pathSegments[2]; // farmer, retailer, logistic, warehouse
    const userId = farmerId || retailerId || logisticId || warehouseId;
    return { role, userId };
  };

  const { role, userId } = getUserRoleAndId();

  // Helper function to format Firestore timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";

    // Check if it's a Firestore timestamp object
    if (timestamp && typeof timestamp === "object" && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If it's already a string or Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If it's a string, try to parse it
    if (typeof timestamp === "string") {
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }

    return "N/A";
  };

  // Fetch remaining payments from Firebase
  useEffect(() => {
    if (!userId) return;

    const fetchRemainingPayments = async () => {
      try {
        setLoading(true);

        // Firebase collection reference
        const remainingPaymentsRef = collection(
          db,
          role,
          userId,
          "RemainingPayments"
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          remainingPaymentsRef,
          (snapshot) => {
            const payments = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            console.log("Fetched remaining payments:", payments);
            setRemainingPayments(payments);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching remaining payments:", error);
            setLoading(false);
          }
        );

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error("Error setting up Firebase listener:", error);
        setLoading(false);
      }
    };

    const unsubscribe = fetchRemainingPayments();

    // Cleanup function
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [role, userId]);

  // Handle successful payment completion
  const handlePaymentSuccess = async (documentId, paymentData) => {
    try {
      console.log("Payment successful:", paymentData);

      // Firebase delete logic
      const docRef = doc(db, role, userId, "RemainingPayments", documentId);
      await deleteDoc(docRef);

      console.log(
        `Payment processed and document ${documentId} removed from Firebase`
      );

      // Remove from local state (this will also be handled by the real-time listener)
      setRemainingPayments((prev) =>
        prev.filter((payment) => payment.id !== documentId)
      );

      setPayingDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });

      // Show success message
      alert("Payment successful! Thank you for your payment.");
    } catch (error) {
      console.error("Error processing payment:", error);
      setPayingDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });

      // Show error message to user
      alert(
        "Payment was successful but failed to update records. Please contact support."
      );
    }
  };

  // Handle payment processing with Razorpay
  const handlePayment = async (payment) => {
    try {
      setPayingDocuments((prev) => new Set([...prev, payment.id]));

      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
        setPayingDocuments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(payment.id);
          return newSet;
        });
        return;
      }

      // Razorpay options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: payment.costToPay * 100, // Amount in paise (multiply by 100)
        currency: "INR",
        name: "Vendor's Vault",
        description: `Payment for ${payment.productName || "Product"}`,
        image: "/logo.png", // Add your logo path here
        order_id: "", // You can generate order_id from backend if needed
        handler: function (response) {
          // This function is called when payment is successful
          console.log("Razorpay Response:", response);
          handlePaymentSuccess(payment.id, {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: payment.farmerName || "Customer",
          email: "customer@example.com", // You can get this from user data
          contact: "9999999999", // You can get this from user data
        },
        notes: {
          documentId: payment.id,
          productName: payment.productName,
          farmerName: payment.farmerName,
          role: role,
          userId: userId,
        },
        theme: {
          color: "#10B981", // Emerald color to match your theme
        },
        modal: {
          ondismiss: function () {
            // This function is called when payment popup is closed
            console.log("Payment popup closed");
            setPayingDocuments((prev) => {
              const newSet = new Set(prev);
              newSet.delete(payment.id);
              return newSet;
            });
          },
        },
      };

      // Create Razorpay instance and open checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failure
      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description}`);
        setPayingDocuments((prev) => {
          const newSet = new Set(prev);
          newSet.delete(payment.id);
          return newSet;
        });
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPayingDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(payment.id);
        return newSet;
      });

      // Show error message to user
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 relative">
      {/* Decorative background elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-200 opacity-20 blur-3xl rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Remaining Payments
            </h1>
            <p className="text-gray-600">
              Role:{" "}
              <span className="font-semibold capitalize text-emerald-600">
                {role}
              </span>{" "}
              | User ID:{" "}
              <span className="font-semibold text-teal-600">{userId}</span>
            </p>
          </div>

          {remainingPayments.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-12 text-center">
              <div className="text-gray-600 text-xl mb-4 font-semibold">
                No remaining payments found
              </div>
              <div className="text-gray-500">
                All payments have been completed!
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {remainingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-6 hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <div className="mb-4 pb-4 border-b border-emerald-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Payment Details
                    </h3>
                    <div className="text-sm text-gray-600">
                      Document ID: {payment.id}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost to Pay:</span>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(payment.costToPay)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-semibold text-gray-800">
                        {payment.productName || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Farmer:</span>
                      <span className="font-semibold text-gray-800">
                        {payment.farmerName || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-semibold text-gray-800">
                        {payment.requestedQuantity}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(payment.sellingPrice)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.paymentStatus === "unpaid"
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {payment.paymentStatus}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                      <div>Created: {formatTimestamp(payment.createdAt)}</div>
                      <div>Updated: {formatTimestamp(payment.timestamp)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePayment(payment)}
                    disabled={payingDocuments.has(payment.id)}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform ${
                      payingDocuments.has(payment.id)
                        ? "bg-emerald-400 text-white cursor-not-allowed scale-95"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:shadow-lg hover:scale-105"
                    }`}
                  >
                    {payingDocuments.has(payment.id) ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                        Opening Payment...
                      </div>
                    ) : (
                      "Pay with Razorpay"
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonRemainingPayment;
