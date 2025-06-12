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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Warehouse Control Panel
      </h2>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-900 p-4 rounded-lg">
        <input
          type="text"
          name="storageName"
          placeholder="Storage Name *"
          value={newStorage.storageName}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity (kg)"
          value={newStorage.capacity}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="type"
          placeholder="Storage Type (Cold, Dry, etc.)"
          value={newStorage.type}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="pricePerDay"
          placeholder="Price per Day (INR)"
          value={newStorage.pricePerDay}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={newStorage.location}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <select
          name="availabilityStatus"
          value={newStorage.availabilityStatus}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <button
          onClick={handleAddOrUpdate}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-white font-semibold col-span-full"
        >
          {editId ? "Update Storage" : "Add Storage"}
        </button>
      </div>

      {/* Storage List */}
      {loading ? (
        <p className="text-white">Loading storage data...</p>
      ) : (
        <ul className="space-y-3">
          {storages.map((storage) => (
            <li
              key={storage.id}
              className="bg-gray-800 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div className="text-white">
                <p>
                  <strong>Name:</strong> {storage.storageName}
                </p>
                <p>
                  <strong>Type:</strong> {storage.type}
                </p>
                <p>
                  <strong>Capacity:</strong> {storage.capacity} kg
                </p>
                <p>
                  <strong>Price/Day:</strong> ₹{storage.pricePerDay}
                </p>
                <p>
                  <strong>Location:</strong> {storage.location}
                </p>
                <p>
                  <strong>Status:</strong> {storage.availabilityStatus}
                </p>
              </div>
              <div className="flex gap-4 mt-3 md:mt-0">
                <button
                  onClick={() => handleEdit(storage)}
                  className="text-yellow-400 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(storage.id)}
                  className="text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WControlPanel;
