import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const roles = ["farmer", "warehouse", "logistic", "retailer"];

const roleToSubcollection = {
  farmer: "availableproducts",
  retailer: "availableProducts",
  logistic: "fleets",
  warehouse: "storages",
};

const CommonRequestPage = () => {
  // ✅ Extract from URL: /dashboard/<role>/<roleId>/make-request
  const location = useLocation();
  const pathSegments = location.pathname.split("/");
  const requesterRole = pathSegments[2];
  const requesterId = pathSegments[3];

  const [selectedRole, setSelectedRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [requestedQuantity, setRequestedQuantity] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedRole) return;
      setLoading(true);
      const snap = await getDocs(collection(db, selectedRole));
      const usersData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setProducts([]);
      setSelectedUserId(null);
      setLoading(false);
    };
    fetchUsers();
  }, [selectedRole]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedRole || !selectedUserId) return;
      const subcollection = roleToSubcollection[selectedRole];
      if (!subcollection) return;

      const productsRef = collection(
        db,
        `${selectedRole}/${selectedUserId}/${subcollection}`
      );
      const snap = await getDocs(productsRef);
      const productList = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };
    fetchProducts();
  }, [selectedUserId, selectedRole]);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setRequestedQuantity("");
    setShowModal(true);
  };

  const handleSendRequest = async () => {
    try {
      if (
        !requestedQuantity ||
        isNaN(requestedQuantity) ||
        requestedQuantity <= 0
      ) {
        alert("Please enter a valid quantity.");
        return;
      }

      if (
        selectedProduct.quantity &&
        Number(requestedQuantity) > Number(selectedProduct.quantity)
      ) {
        alert(
          `Only ${selectedProduct.quantity} units are available. Cannot request more than available.`
        );
        return;
      }

      const requestRef = collection(
        db,
        `${selectedRole}/${selectedUserId}/requests`
      );

      await addDoc(requestRef, {
        ...selectedProduct,
        requestedQuantity,
        timestamp: new Date(),
        status: "pending",
        requestedByRole: requesterRole,
        requestedById: requesterId,
      });

      alert("Request sent successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to send request.");
    }
  };

  const renderProductDetails = (product) => {
    switch (selectedRole) {
      case "farmer":
        return (
          <>
            <p>
              <strong>Name:</strong> {product.name}
            </p>
            <p>
              <strong>Harvest Date:</strong> {product.harvestDate}
            </p>
            <p>
              <strong>Price:</strong> ₹{product.price}
            </p>
            <p>
              <strong>Quantity:</strong> {product.quantity}
            </p>
            <p>
              <strong>Quality:</strong> {product.quality}
            </p>
          </>
        );
      case "retailer":
        return (
          <>
            <p>
              <strong>Name:</strong> {product.name}
            </p>
            <p>
              <strong>Brand:</strong> {product.brand}
            </p>
            <p>
              <strong>Expiry Date:</strong> {product.expiryDate}
            </p>
            <p>
              <strong>Selling Price:</strong> ₹{product.sellingPrice}
            </p>
            <p>
              <strong>Quantity:</strong> {product.quantity}
            </p>
          </>
        );
      case "warehouse":
        return (
          <>
            <p>
              <strong>Storage Name:</strong> {product.storageName}
            </p>
            <p>
              <strong>Location:</strong> {product.location}
            </p>
            <p>
              <strong>Type:</strong> {product.type}
            </p>
            <p>
              <strong>Price/Day:</strong> ₹{product.pricePerDay}
            </p>
            <p>
              <strong>Capacity:</strong> {product.capacity}
            </p>
          </>
        );
      case "logistic":
        return (
          <>
            <p>
              <strong>Vehicle Type:</strong> {product.type}
            </p>
            <p>
              <strong>Driver:</strong> {product.driverName}
            </p>
            <p>
              <strong>Vehicle No:</strong> {product.vehicleNumber}
            </p>
            <p>
              <strong>Fuel Type:</strong> {product.fuelType}
            </p>
            <p>
              <strong>Capacity:</strong> {product.capacity}
            </p>
          </>
        );
      default:
        return <p>No info available</p>;
    }
  };

  const renderUserDetails = (user) => {
    switch (selectedRole) {
      case "farmer":
        return (
          <>
            <p>
              <strong>Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Land Size:</strong> {user.landSize}
            </p>
            <p>
              <strong>Years Farming:</strong> {user.yearsFarming}
            </p>
          </>
        );
      case "logistic":
        return (
          <>
            <p>
              <strong>Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Service Area:</strong> {user.serviceArea}
            </p>
            <p>
              <strong>Experience:</strong> {user.yearsExperience} yrs
            </p>
          </>
        );
      case "warehouse":
        return (
          <>
            <p>
              <strong>Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Capacity:</strong> {user.capacity}
            </p>
            <p>
              <strong>Since:</strong> {user.operationalSince}
            </p>
          </>
        );
      case "retailer":
        return (
          <>
            <p>
              <strong>Name:</strong> {user.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone}
            </p>
            <p>
              <strong>Business:</strong> {user.businessName}
            </p>
            <p>
              <strong>Experience:</strong> {user.yearsInBusiness} yrs
            </p>
          </>
        );
      default:
        return <p>{user.name || user.email || user.id}</p>;
    }
  };

  return (
    <>
      <div className="flex h-full w-full text-gray-800 bg-gradient-to-br from-emerald-50 to-teal-100">
        {/* Sidebar */}
        <div className="w-1/5 bg-gradient-to-b from-emerald-100 to-teal-100 p-4 space-y-4 overflow-y-auto border-r border-emerald-200">
          <h2 className="text-xl font-bold text-gray-800">Select Role</h2>
          {roles.map((r) => (
            <button
              key={r}
              className={`w-full px-4 py-2 text-left rounded-xl transition-all duration-200 font-semibold ${
                selectedRole === r
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                  : "bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-emerald-400 hover:to-teal-500 hover:text-white border border-emerald-100"
              }`}
              onClick={() => setSelectedRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Users */}
        <div className="w-2/5 p-4 bg-gradient-to-b from-teal-50 to-emerald-50 space-y-2 overflow-y-auto border-r border-teal-200">
          <h2 className="text-xl font-bold mb-2 text-gray-800">
            {selectedRole ? `Select ${selectedRole}` : "Please select a role"}
          </h2>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : (
            users.map((u) => (
              <button
                key={u.id}
                className={`block w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  selectedUserId === u.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-green-400 hover:to-emerald-500 hover:text-white border border-green-100"
                } hover:scale-105 hover:shadow-lg`}
                onClick={() => setSelectedUserId(u.id)}
              >
                {renderUserDetails(u)}
              </button>
            ))
          )}
        </div>

        {/* Products */}
        <div className="w-2/5 p-4 bg-gradient-to-b from-green-50 to-emerald-50 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Available Items
          </h2>
          {products.length === 0 ? (
            <p className="text-gray-600">No items found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-3 space-y-2 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="text-gray-700">
                  {renderProductDetails(product)}
                </div>
                <button
                  onClick={() => handleOpenModal(product)}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Make Request
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm text-gray-800 p-6 rounded-2xl shadow-2xl w-96 border border-emerald-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Request Product
            </h2>
            <div className="space-y-2 text-sm mb-4 text-gray-700">
              {selectedProduct && renderProductDetails(selectedProduct)}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Quantity to Request:
              </label>
              <input
                type="number"
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
                placeholder="Enter quantity"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded-xl text-white font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl text-white font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommonRequestPage;
