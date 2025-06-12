import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

const ControlPanel = () => {
  const { farmerId } = useParams();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newCrop, setNewCrop] = useState({
    name: "",
    quantity: "",
    price: "",
    quality: "",
    harvestDate: "",
  });

  const cropsCollectionRef = collection(
    db,
    `farmer/${farmerId}/availableproducts`
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(cropsCollectionRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCrops(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [farmerId]);

  const handleChange = (e) => {
    setNewCrop({ ...newCrop, [e.target.name]: e.target.value });
  };

  const handleAddCrop = async () => {
    const { name, quantity, price, quality, harvestDate } = newCrop;
    if (!name.trim() || !quantity || !price) {
      alert("Please fill at least name, quantity, and price.");
      return;
    }

    await addDoc(cropsCollectionRef, {
      name,
      quantity,
      price,
      quality,
      harvestDate,
      addedAt: new Date(),
    });

    setNewCrop({
      name: "",
      quantity: "",
      price: "",
      quality: "",
      harvestDate: "",
    });
  };

  const handleDeleteCrop = async (cropId) => {
    const cropDocRef = doc(db, `farmer/${farmerId}/availableproducts`, cropId);
    await deleteDoc(cropDocRef);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Control Panel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-900 p-4 rounded-lg">
        <input
          type="text"
          name="name"
          placeholder="Crop Name"
          value={newCrop.name}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity (kg)"
          value={newCrop.quantity}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹ per kg)"
          value={newCrop.price}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="quality"
          placeholder="Quality (e.g. A+, B)"
          value={newCrop.quality}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="date"
          name="harvestDate"
          placeholder="Harvest Date"
          value={newCrop.harvestDate}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />

        <button
          onClick={handleAddCrop}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-white font-semibold col-span-full"
        >
          Add Crop
        </button>
      </div>

      {loading ? (
        <p>Loading crops...</p>
      ) : (
        <ul className="space-y-3">
          {crops.map((crop) => (
            <li
              key={crop.id}
              className="bg-gray-800 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div className="text-white">
                <p>
                  <strong>Name:</strong> {crop.name}
                </p>
                <p>
                  <strong>Quantity:</strong> {crop.quantity} kg
                </p>
                <p>
                  <strong>Price:</strong> ₹{crop.price}/kg
                </p>
                <p>
                  <strong>Quality:</strong> {crop.quality || "N/A"}
                </p>
                <p>
                  <strong>Harvest Date:</strong> {crop.harvestDate || "N/A"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteCrop(crop.id)}
                className="text-red-400 hover:underline mt-3 md:mt-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ControlPanel;
