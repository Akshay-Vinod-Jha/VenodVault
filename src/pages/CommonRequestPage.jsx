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
      <div className="flex h-full w-full text-white">
        {/* Sidebar */}
        <div className="w-1/5 bg-gray-800 p-4 space-y-4 overflow-y-auto">
          <h2 className="text-xl font-bold">Select Role</h2>
          {roles.map((r) => (
            <button
              key={r}
              className={`w-full px-4 py-2 text-left rounded hover:bg-blue-700 ${
                selectedRole === r ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setSelectedRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Users */}
        <div className="w-2/5 p-4 bg-gray-900 space-y-2 overflow-y-auto">
          <h2 className="text-xl font-bold mb-2">
            {selectedRole ? `Select ${selectedRole}` : "Please select a role"}
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            users.map((u) => (
              <button
                key={u.id}
                className={`block w-full text-left p-3 rounded ${
                  selectedUserId === u.id ? "bg-green-600" : "bg-gray-700"
                } hover:bg-green-700`}
                onClick={() => setSelectedUserId(u.id)}
              >
                {renderUserDetails(u)}
              </button>
            ))
          )}
        </div>

        {/* Products */}
        <div className="w-2/5 p-4 bg-gray-800 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Available Items</h2>
          {products.length === 0 ? (
            <p>No items found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-700 rounded p-4 mb-3 space-y-2"
              >
                {renderProductDetails(product)}
                <button
                  onClick={() => handleOpenModal(product)}
                  className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded"
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
          <div className="bg-white text-black p-6 rounded shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4">Request Product</h2>
            <div className="space-y-2 text-sm mb-4">
              {selectedProduct && renderProductDetails(selectedProduct)}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Quantity to Request:
              </label>
              <input
                type="number"
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(e.target.value)}
                className="w-full border border-gray-400 px-3 py-1 rounded"
                placeholder="Enter quantity"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
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
