import React, { useState } from "react";
import {jwtDecode} from "jwt-decode";
import Navbar from "./Navbar";
import './OrdersHistory.css';

const OrdersButtons = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null; // Return null if the cookie is not found
};
  const fetchOrders = async (orderType) => {
    setActiveTab(orderType);
    setLoading(true);
    setError(null);

    try {
        const jwtToken = getCookie('jwt');
                if (!jwtToken) {
                    console.error('JWT Token not found');
                    throw new Error('Not authenticated');
                }

                const decoded = jwtDecode(jwtToken);
                const userId = decoded.id;
      const response = await fetch(`http://localhost:5000/${orderType}-orders/${userId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log(`Fetched ${orderType} orders:`, data);
      setOrders(data);
    } catch (err) {
      console.error(`Error fetching ${orderType} orders:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
        <Navbar /> <br/><br/><br/><br/> <br/> <br/>
      <div className="flex gap-4 mb-6">
        {["pending", "bought", "sold"].map((type) => (
          <button
            key={type}
            onClick={() => fetchOrders(type)}
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === type
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Orders
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p className="text-center text-red-500">Error: {error}</p>}
      {!loading && !error && orders.length === 0 && activeTab && (
        <p className="text-center text-gray-500">No {activeTab} orders found.</p>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow-md p-4 rounded-lg">
            <h3 className="font-semibold text-lg">Order ID : {order._id}</h3>
            <p className="text-gray-600">Seller ID : {order.sellerId || "YOU"}</p>

            {/* Display Items */}
            <div className="mt-2">
              <h4 className="font-semibold">Items:</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {order.items.map((item, index) => (
                  <li key={index}>{JSON.stringify(item)}</li>
                ))}
              </ul>

            </div>
            <div className="mt-2">
              <h4 className="font-semibold">OTP : </h4>
              <p className="text-gray-600">{order.otp || "Not available"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersButtons;
