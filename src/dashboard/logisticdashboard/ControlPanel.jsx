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
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

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
    const unsubscribe = onSnapshot(
      vehiclesCollectionRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching vehicles:", error);
        setLoading(false);
      }
    );
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

    setAddingVehicle(true);

    try {
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
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle. Please try again.");
    } finally {
      setAddingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    setDeletingVehicle(vehicleId);

    try {
      const vehicleDocRef = doc(db, `logistic/${logisticId}/fleets`, vehicleId);
      await deleteDoc(vehicleDocRef);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle. Please try again.");
    } finally {
      setDeletingVehicle(null);
    }
  };

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
          Logistic Control Panel
        </h2>

        {/* Add Vehicle Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Add New Vehicle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="vehicleNumber"
              placeholder="Vehicle Number *"
              value={newVehicle.vehicleNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="text"
              name="type"
              placeholder="Vehicle Type (Truck, Van)"
              value={newVehicle.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="text"
              name="driverName"
              placeholder="Driver Name"
              value={newVehicle.driverName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="number"
              name="capacity"
              placeholder="Capacity (kg)"
              value={newVehicle.capacity}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <input
              type="text"
              name="fuelType"
              placeholder="Fuel Type (Diesel, CNG)"
              value={newVehicle.fuelType}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
            />
            <select
              name="status"
              value={newVehicle.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 appearance-none cursor-pointer"
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <button
              onClick={handleAddVehicle}
              disabled={addingVehicle}
              className={`col-span-full py-4 px-6 text-white font-semibold rounded-xl transition-all duration-200 transform ${
                addingVehicle
                  ? "bg-emerald-400 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg"
              }`}
            >
              {addingVehicle ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Adding Vehicle...
                </div>
              ) : (
                "Add Vehicle"
              )}
            </button>
          </div>
        </div>

        {/* Fleet List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-emerald-100 shadow-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading fleet data...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-emerald-100 shadow-lg">
                  <p className="text-gray-600 text-lg">
                    No vehicles added yet.
                  </p>
                </div>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-100 p-6 transition-all duration-200 hover:shadow-xl"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <p className="text-gray-700">
                          <strong className="text-gray-800">Vehicle No:</strong>{" "}
                          {vehicle.vehicleNumber}
                        </p>
                        <p className="text-gray-700">
                          <strong className="text-gray-800">Type:</strong>{" "}
                          {vehicle.type || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <strong className="text-gray-800">Driver:</strong>{" "}
                          {vehicle.driverName || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <strong className="text-gray-800">Capacity:</strong>{" "}
                          {vehicle.capacity || "N/A"} kg
                        </p>
                        <p className="text-gray-700">
                          <strong className="text-gray-800">Fuel:</strong>{" "}
                          {vehicle.fuelType || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <strong className="text-gray-800">Status:</strong>{" "}
                          <span
                            className={`font-semibold ${
                              vehicle.status === "available"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {vehicle.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      disabled={deletingVehicle === vehicle.id}
                      className={`mt-4 md:mt-0 md:ml-4 px-4 py-2 text-white font-semibold rounded-xl transition-all duration-200 transform ${
                        deletingVehicle === vehicle.id
                          ? "bg-red-400 cursor-not-allowed scale-95"
                          : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-105 hover:shadow-lg"
                      }`}
                    >
                      {deletingVehicle === vehicle.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Deleting...
                        </div>
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LControlPanel;
