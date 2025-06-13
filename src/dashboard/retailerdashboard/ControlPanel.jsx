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
import {
  Package,
  Plus,
  Trash2,
  Store,
  Calendar,
  Tag,
  DollarSign,
  Hash,
} from "lucide-react";

const RControlPanel = () => {
  const { retailerId } = useParams(); // Commented for demo - replace with actual retailerId
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false for demo
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    quantity: "",
    sellingPrice: "",
    brand: "",
    expiryDate: "",
  });

  const productsCollectionRef = collection(
    db,
    `retailer/${retailerId}/availableProducts`
  );

  // Real-time listener for products - commented for demo
  useEffect(() => {
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [retailerId]);

  // Handle form input changes
  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  // Add new product to database - Firebase logic commented for demo
  // Fixed version - remove the manual state update
  const handleAddProduct = async () => {
    const { name, quantity, sellingPrice, brand, expiryDate } = newProduct;
    if (!name.trim() || !quantity || !sellingPrice) {
      alert("Please fill in the required fields: name, quantity, and price.");
      return;
    }

    setIsAddingProduct(true);
    try {
      // Only add to Firebase - the listener will update the state automatically
      await addDoc(productsCollectionRef, {
        name,
        quantity: parseInt(quantity),
        sellingPrice: parseFloat(sellingPrice),
        brand,
        expiryDate,
        addedAt: new Date(),
      });

      // Clear the form
      setNewProduct({
        name: "",
        quantity: "",
        sellingPrice: "",
        brand: "",
        expiryDate: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Delete product from database - Firebase logic commented for demo
  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      // Simulate Firebase delete
      const productDocRef = doc(
        db,
        `retailer/${retailerId}/availableProducts`,
        productId
      );
      await deleteDoc(productDocRef);

      // Demo: Remove from local state instead
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-200 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-200 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Retailer Control Panel
              </h1>
              <p className="text-gray-600">
                Manage your inventory and product listings
              </p>
            </div>
          </div>
        </div>

        {/* Add Product Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Add New Product
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                placeholder="Enter quantity"
                value={newProduct.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="sellingPrice"
                placeholder="Enter price per unit"
                value={newProduct.sellingPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                Brand Name
              </label>
              <input
                type="text"
                name="brand"
                placeholder="Enter brand name"
                value={newProduct.brand}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={newProduct.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Add Product Button */}
          <div className="mt-8">
            <button
              onClick={handleAddProduct}
              disabled={isAddingProduct}
              className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 transform ${
                isAddingProduct
                  ? "bg-emerald-400 cursor-not-allowed scale-95"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 hover:shadow-lg"
              } text-white`}
            >
              {isAddingProduct ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Product...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Add Product to Inventory
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Products List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-emerald-100 p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Current Inventory
              </h2>
              <p className="text-gray-600">
                {products.length} products available
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                No products in inventory
              </p>
              <p className="text-gray-400">
                Add your first product using the form above
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 lg:mb-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Product Name
                        </p>
                        <p className="text-gray-800 font-medium">
                          {product.name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Quantity
                        </p>
                        <p className="text-gray-800 font-medium">
                          {product.quantity} units
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Price
                        </p>
                        <p className="text-gray-800 font-medium">
                          ₹{product.sellingPrice}/unit
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Brand
                        </p>
                        <p className="text-gray-800 font-medium">
                          {product.brand || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">
                          Expiry Date
                        </p>
                        <p className="text-gray-800 font-medium">
                          {product.expiryDate || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="lg:ml-6">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RControlPanel;
