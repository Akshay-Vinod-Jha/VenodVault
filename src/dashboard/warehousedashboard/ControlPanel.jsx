import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

const WControlPanel = () => {
  const { warehouseId } = useParams();
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);

  const [newStorage, setNewStorage] = useState({
    storageName: "",
    capacity: "",
    type: "",
    pricePerDay: "",
    location: "",
    availabilityStatus: "available",
  });

  const storageCollectionRef = collection(
    db,
    `warehouse/${warehouseId}/storages`
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(storageCollectionRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStorages(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [warehouseId]);

  const handleChange = (e) => {
    setNewStorage({ ...newStorage, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    if (!newStorage.storageName.trim()) {
      alert("Storage name is required.");
      return;
    }

    if (editId) {
      const docRef = doc(db, `warehouse/${warehouseId}/storages`, editId);
      await updateDoc(docRef, { ...newStorage });
      setEditId(null);
    } else {
      await addDoc(storageCollectionRef, {
        ...newStorage,
        createdAt: new Date(),
      });
    }

    setNewStorage({
      storageName: "",
      capacity: "",
      type: "",
      pricePerDay: "",
      location: "",
      availabilityStatus: "available",
    });
  };

  const handleEdit = (storage) => {
    setNewStorage(storage);
    setEditId(storage.id);
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, `warehouse/${warehouseId}/storages`, id);
    await deleteDoc(docRef);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Warehouse Control Panel
        </h2>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="storageName"
              placeholder="Storage Name *"
              value={newStorage.storageName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="number"
              name="capacity"
              placeholder="Capacity (kg)"
              value={newStorage.capacity}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="text"
              name="type"
              placeholder="Storage Type (Cold, Dry, etc.)"
              value={newStorage.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="number"
              name="pricePerDay"
              placeholder="Price per Day (INR)"
              value={newStorage.pricePerDay}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={newStorage.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <select
              name="availabilityStatus"
              value={newStorage.availabilityStatus}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 appearance-none cursor-pointer"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <button
              onClick={handleAddOrUpdate}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg transition-all duration-200 transform py-4 px-6 rounded-xl text-white font-semibold col-span-full"
            >
              {editId ? "Update Storage" : "Add Storage"}
            </button>
          </div>
        </div>

        {/* Storage List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl shadow-2xl p-6">
            <p className="text-gray-600">Loading storage data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {storages.map((storage) => (
              <div
                key={storage.id}
                className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:justify-between md:items-center"
              >
                <div className="text-gray-800">
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">Name:</span>{" "}
                    {storage.storageName}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">Type:</span>{" "}
                    {storage.type}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">
                      Capacity:
                    </span>{" "}
                    {storage.capacity} kg
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">
                      Price/Day:
                    </span>{" "}
                    ₹{storage.pricePerDay}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold text-gray-700">
                      Location:
                    </span>{" "}
                    {storage.location}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-700">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        storage.availabilityStatus === "available"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {storage.availabilityStatus}
                    </span>
                  </p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                  <button
                    onClick={() => handleEdit(storage)}
                    className="text-teal-600 hover:text-teal-700 hover:underline transition-colors duration-200 font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(storage.id)}
                    className="text-red-500 hover:text-red-600 hover:underline transition-colors duration-200 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-emerald-200 opacity-20 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-200 opacity-20 blur-3xl rounded-full transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-green-200 opacity-10 blur-3xl rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
    </div>
  );
};

export default WControlPanel;
