import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';

const DeliverItems = () => {
    const [pendingDeliveries, setPendingDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Return null if the cookie is not found
    };

    useEffect(() => {
        const fetchPendingDeliveries = async () => {
            try {
                const jwtToken = getCookie('jwt');
                console.log('cookies:', jwtToken);
                //const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));

                if (!jwtToken) {
                    setError('Not authenticated');
                    return;
                }

                //const token = jwtCookie.split('=')[1];
                const decoded = jwtDecode(jwtToken);
                const sellerId = decoded.id;
                console.log('Seller ID:', sellerId);


                // Fetch pending transactions for this seller
                const response = await fetch(`http://localhost:5000/pending-deliveries/${sellerId}`, {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch pending deliveries');
                }

                const data = await response.json();
                setPendingDeliveries(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPendingDeliveries();
    }, []);

    const handleVerifyOTP = async (transactionId) => {
        try {
            const otp = prompt('Please enter the OTP received from buyer:');
            if (!otp) return;
            
            const response = await fetch('http://localhost:5000/verify-delivery', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    transactionId,
                    otp
                })
            });
            const data = await response.json();

            if (response.ok) {
                // Remove the delivered item from the list
                setPendingDeliveries(prev =>
                    prev.filter(delivery => delivery._id !== transactionId)
                );
                alert('Delivery verified successfully!');
            } else {
                alert(data.message || 'Failed to verify OTP');
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            alert('Failed to verify OTP');
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <br/>
            <br/>
            <br/>
            <h1 className="text-3xl font-bold mb-6">Pending Deliveries</h1>

            {pendingDeliveries.length === 0 ? (
                <div className="text-center text-gray-500">
                    No pending deliveries found.
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingDeliveries.map((delivery) => (
                        <div
                            key={delivery._id}
                            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-600">
                                        Buyer ID : {delivery.buyerEmail}
                                    </p>
                                    {delivery.items.map((item, index) => (
    <div key={index} className="border p-2 rounded-md shadow-sm">
        <p className="text-gray-600">
            <strong>Item Name : </strong> {item.name}
        </p>
        <p className="text-gray-600">
            <strong>Amount : </strong> ${item.price}
        </p>
    </div>
))}

                                </div>
                                <button
                                    onClick={() => handleVerifyOTP(delivery.transactionId)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                >
                                    Verify Delivery
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DeliverItems;