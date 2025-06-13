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
    <div className="p-6 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Control Panel</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-emerald-100 shadow-lg">
        <input
          type="text"
          name="name"
          placeholder="Crop Name"
          value={newCrop.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity (kg)"
          value={newCrop.quantity}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
        />
        <input
          type="number"
          name="price"
          placeholder="Price (₹ per kg)"
          value={newCrop.price}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
        />
        <input
          type="text"
          name="quality"
          placeholder="Quality (e.g. A+, B)"
          value={newCrop.quality}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
        />
        <input
          type="date"
          name="harvestDate"
          placeholder="Harvest Date"
          value={newCrop.harvestDate}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
        />

        <button
          onClick={handleAddCrop}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-6 py-4 rounded-xl text-white font-semibold col-span-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          Add Crop
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading crops...</p>
      ) : (
        <ul className="space-y-3">
          {crops.map((crop) => (
            <li
              key={crop.id}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-xl flex flex-col md:flex-row md:justify-between md:items-center border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="text-gray-700">
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
                className="text-red-500 hover:text-red-700 hover:underline mt-3 md:mt-0 font-semibold transition-colors duration-200"
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
