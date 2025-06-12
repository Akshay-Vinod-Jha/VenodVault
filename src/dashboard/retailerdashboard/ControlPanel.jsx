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

const RControlPanel = () => {
  const { retailerId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const unsubscribe = onSnapshot(productsCollectionRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [retailerId]);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    const { name, quantity, sellingPrice, brand, expiryDate } = newProduct;
    if (!name.trim() || !quantity || !sellingPrice) {
      alert("Please fill in the required fields: name, quantity, and price.");
      return;
    }

    await addDoc(productsCollectionRef, {
      name,
      quantity,
      sellingPrice,
      brand,
      expiryDate,
      addedAt: new Date(),
    });

    setNewProduct({
      name: "",
      quantity: "",
      sellingPrice: "",
      brand: "",
      expiryDate: "",
    });
  };

  const handleDeleteProduct = async (productId) => {
    const productDocRef = doc(
      db,
      `retailer/${retailerId}/availableProducts`,
      productId
    );
    await deleteDoc(productDocRef);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Retailer Control Panel
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-900 p-4 rounded-lg">
        <input
          type="text"
          name="name"
          placeholder="Product Name *"
          value={newProduct.name}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity (units) *"
          value={newProduct.quantity}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="number"
          name="sellingPrice"
          placeholder="Selling Price (₹ per unit) *"
          value={newProduct.sellingPrice}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="text"
          name="brand"
          placeholder="Brand Name"
          value={newProduct.brand}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />
        <input
          type="date"
          name="expiryDate"
          placeholder="Expiry Date"
          value={newProduct.expiryDate}
          onChange={handleChange}
          className="p-2 rounded bg-gray-700 text-white"
        />

        <button
          onClick={handleAddProduct}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-white font-semibold col-span-full"
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-white">Loading products...</p>
      ) : (
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="bg-gray-800 p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center"
            >
              <div className="text-white">
                <p>
                  <strong>Name:</strong> {product.name}
                </p>
                <p>
                  <strong>Quantity:</strong> {product.quantity} units
                </p>
                <p>
                  <strong>Price:</strong> ₹{product.sellingPrice}/unit
                </p>
                <p>
                  <strong>Brand:</strong> {product.brand || "N/A"}
                </p>
                <p>
                  <strong>Expiry:</strong> {product.expiryDate || "N/A"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteProduct(product.id)}
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

export default RControlPanel;
