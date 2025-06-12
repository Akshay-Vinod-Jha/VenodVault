import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  const { role: requesterRole, roleuserid: requesterId } = useParams();
  const [selectedRole, setSelectedRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users of selected role
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

  // Fetch products of selected user based on role
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

  const handleMakeRequest = async (product) => {
    try {
      const requestRef = collection(
        db,
        `${selectedRole}/${selectedUserId}/requests`
      );
      await addDoc(requestRef, {
        ...product,
        timestamp: new Date(),
        status: "pending",
        requestedByRole: requesterRole,
        requestedById: requesterId,
      });
      alert("Request sent successfully!");
    } catch (error) {
      console.error("Failed to send request", error);
      alert("Failed to send request");
    }
  };

  return (
    <div className="flex h-screen w-screen text-white">
      {/* Roles Sidebar */}
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

      {/* Users List */}
      <div className="w-2/5 p-4 space-y-2 bg-gray-900 overflow-y-auto">
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
              {u.name || u.email || u.id}
            </button>
          ))
        )}
      </div>

      {/* Products and Request */}
      <div className="w-2/5 p-4 bg-gray-800 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Available Items</h2>
        {products.length === 0 ? (
          <p>No items found.</p>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-700 rounded p-4 mb-3 space-y-1"
            >
              <p>
                <strong>Name:</strong>{" "}
                {product.productName ||
                  product.fleetName ||
                  product.storageName ||
                  "Unnamed"}
              </p>
              <p>
                <strong>Quantity:</strong>{" "}
                {product.quantity || product.capacity || "N/A"}{" "}
                {product.unit || ""}
              </p>
              <button
                onClick={() => handleMakeRequest(product)}
                className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Make Request
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommonRequestPage;
