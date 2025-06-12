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

const LControlPanel = () => {
  const { logisticId } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newVehicle, setNewVehicle] = useState({
    vehicleNumber: "",
    type: "",
    driverName: "",
    capacity: "",
    fuelType: "",
    status: "available",
  });

  const vehiclesCollectionRef = collection(db, `logistic/${logisticId}/fleets`);

  useEffect(() => {
    const unsubscribe = onSnapshot(vehiclesCollectionRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVehicles(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [logisticId]);

  const handleChange = (e) => {
    setNewVehicle({ ...newVehicle, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = async () => {
    const { vehicleNumber, type, driverName, capacity, fuelType, status } =
      newVehicle;

    if (!vehicleNumber.trim()) {
      alert("Vehicle Number is required.");
      return;
    }

    await addDoc(vehiclesCollectionRef, {
      vehicleNumber,
      type,
      driverName,
      capacity,
      fuelType,
      status,
      addedAt: new Date(),
    });

    setNewVehicle({
      vehicleNumber: "",
      type: "",
      driverName: "",
      capacity: "",
      fuelType: "",
      status: "available",
    });
  };

  const handleDeleteVehicle = async (vehicleId) => {
    const vehicleDocRef = doc(db, `logistic/${logisticId}/fleets`, vehicleId);
    await deleteDoc(vehicleDocRef);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Logistic Control Panel
      </h2>

      {/* Add Vehicle Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-900 p-4 rounded-lg">
        <input
          type="text"
          name="vehicleNumber"
          placeholder="Vehicle Number *"
          value={newVehicle.vehicleNumber}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="type"
          placeholder="Vehicle Type (Truck, Van)"
          value={newVehicle.type}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="driverName"
          placeholder="Driver Name"
          value={newVehicle.driverName}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="capacity"
          placeholder="Capacity (kg)"
          value={newVehicle.capacity}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="fuelType"
          placeholder="Fuel Type (Diesel, CNG)"
          value={newVehicle.fuelType}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <select
          name="status"
          value={newVehicle.status}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        >
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <button
          onClick={handleAddVehicle}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-white font-semibold col-span-full"
        >
          Add Vehicle
        </button>
      </div>

      {/* Fleet List */}
      {loading ? (
        <p className="text-white">Loading fleet data...</p>
      ) : (
        <ul className="space-y-3">
          {vehicles.map((vehicle) => (
            <li
              key={vehicle.id}
              className="bg-gray-800 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div className="text-white">
                <p>
                  <strong>Vehicle No:</strong> {vehicle.vehicleNumber}
                </p>
                <p>
                  <strong>Type:</strong> {vehicle.type || "N/A"}
                </p>
                <p>
                  <strong>Driver:</strong> {vehicle.driverName || "N/A"}
                </p>
                <p>
                  <strong>Capacity:</strong> {vehicle.capacity || "N/A"} kg
                </p>
                <p>
                  <strong>Fuel:</strong> {vehicle.fuelType || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {vehicle.status}
                </p>
              </div>
              <button
                onClick={() => handleDeleteVehicle(vehicle.id)}
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

export default LControlPanel;
