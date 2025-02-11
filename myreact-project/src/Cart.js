import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { jwtDecode } from 'jwt-decode';
import { set } from 'mongoose';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [otp, setOtp] = useState('');
    const [otps, setOtps] = useState([]);
    const [transactionID, setTransactionID] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch('http://localhost:5000/cart', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cart items');
                }

                const data = await response.json();
                setCartItems(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    const removeFromCart = async (itemId) => {
        try {
            const response = await fetch('http://localhost:5000/cart/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ itemId })
            });

            if (!response.ok) {
                throw new Error('Failed to remove item');
            }

            const data = await response.json();
            setCartItems(data.cart);
        } catch (err) {
            console.error('Error removing item:', err);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, cartItem) => 
            total + (cartItem.item.price * cartItem.quantity), 0
        ).toFixed(2);
    };

    if (loading) return <div>Loading cart...</div>;
    if (error) return <div>Error: {error}</div>;
    // const generateOtp = async () => {
    //     try {
    //         // Get the logged-in user's ID from the JWT token
    //         const token = document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, "$1");
            
    //         // Decode the JWT to get the buyer's ID
    //         const decoded = jwt_decode(token);  // You'll need to import jwt-decode library
    //         const buyerID = decoded.id;
    
    //         // Calculate total amount
    //         const amount = cartItems.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
    
    //         // Get unique seller IDs from cart items
    //         const sellerIDs = [...new Set(cartItems.map(cartItem => cartItem.item.sellerId))];
    
    //         // If multiple sellers, you might want to handle this differently
    //         const sellerID = sellerIDs.length > 0 ? sellerIDs[0] : null;
    
    //         if (!sellerID) {
    //             setError('No seller found in cart');
    //             return;
    //         }
    
    //         const response = await fetch('http://localhost:5000/api/generate-otp', {
    //             method: 'POST',
    //             headers: { 
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({
    //                 buyerID, 
    //                 sellerID, 
    //                 amount
    //             }),
    //         });
    
    //         const data = await response.json();
    
    //         if (response.ok) {
    //             setOtp(data.otp); 
    //             setTransactionID(data.transactionID);
    //             setError('');
    //         } else {
    //             setError(data.message || 'Failed to generate OTP');
    //         }
    //     } catch (error) {
    //         console.error('Error generating OTP:', error);
    //         setError('Something went wrong while generating OTP.');
    //     }
    // };
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Return null if the cookie is not found
    };
    
    // const generateOtp = async () => {
    //     try {
    //         // Get JWT token from cookies
    //         const jwtToken = getCookie('jwt');
    //         console.log('cookies:', jwtToken);
    //         //const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
            
    //         if (!jwtToken) {
    //             setError('Not authenticated');
    //             return;
    //         }

    //         //const token = jwtCookie.split('=')[1];
    //         const decoded = jwtDecode(jwtToken);
    //         const buyerID = decoded.id;

    //         console.log('decoded:', decoded);

    //         // Calculate total amount
    //         const amount = parseFloat(calculateTotal());

    //         // Get seller ID from first cart item
    //         if (cartItems.length === 0) {
    //             setError('Cart is empty');
    //             return;
    //         }

    //         const sellerID = cartItems[0].item.sellerId;
    //         console.log('sellerID:', sellerID);

    //         const response = await fetch('http://localhost:5000/api/generate-otp', {
    //             method: 'POST',
    //             headers: { 
    //                 'Content-Type': 'application/json'
    //             },
    //             credentials: 'include',
    //             body: JSON.stringify({
    //                 buyerID,
    //                 sellerID,
    //                 amount
    //             })
    //         });

    //         const data = await response.json();

    //         if (response.ok) {
    //             setOtp(data.otp);
    //             setTransactionID(data.transactionID);
    //             setError('');
    //         } else {
    //             setError(data.message || 'Failed to generate OTP');
    //         }
    //     } catch (error) {
    //         console.error('Error generating OTP:', error);
    //         setError('Failed to generate OTP');
    //     }
    // };
    const handleGenerateOtp = async () => {
        try {
            //Get JWT token from cookies
            const jwtToken = getCookie('jwt');
            console.log('cookies:', jwtToken);
            //const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
            
            if (!jwtToken) {
                setError('Not authenticated');
                return;
            }

            //const token = jwtCookie.split('=')[1];
            const decoded = jwtDecode(jwtToken);
            const buyerID = decoded.id;
            const sellerID = cartItems[0].item.sellerId;
            const response = await fetch('http://localhost:5000/api/generate-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    buyerID,
                    sellerID,
                    amount: parseFloat(calculateTotal()), 
                }),
            });
    
            const result = await response.json();
            if (response.ok) {
                console.log('Generated OTPs:', result.otps);
    
                // Display OTPs for each seller
                result.otps.forEach((otpInfo) => {
                    console.log(
                        `Seller ID: ${otpInfo.sellerID}, Transaction ID: ${otpInfo.transactionID}, OTP: ${otpInfo.otp}`
                    );
                    
                    // You can also update the UI to show these details
                });
                setOtps(result.otps); 
            } else {
                console.error('Failed to generate OTPs:', result.message);
            }
        } catch (error) {
            console.error('Error generating OTPs:', error);
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <Navbar />
            <br />
            <br />
            <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

            {cartItems.length === 0 ? (
                <div className="text-center text-gray-500">
                    Your cart is empty. 
                    <Link to="/search" className="text-blue-500 ml-2">
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div>
                    {cartItems.map((cartItem) => (
                        <div 
                            key={cartItem.item._id} 
                            className="flex items-center justify-between border-b py-4"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 bg-gray-200 flex items-center justify-center">
                                    <span>Image</span>
                                </div>
                                <div>
                                <Link 
    to={`/cart/item/${cartItem.item._id}`} 
    className="text-xl font-semibold hover:text-blue-600 underline"
>
    {cartItem.item.name}
</Link>
                                    <p className="text-gray-600">
                                    ₹{cartItem.item.price.toFixed(2)} each
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center border rounded">
                                    <span className="px-4">
                                        Quantity: {cartItem.quantity}
                                    </span>
                                </div>
                                <div className="font-bold">
                                ₹{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                                </div>
                                <button 
                                    onClick={() => removeFromCart(cartItem.item._id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 flex justify-between items-center">
                        <Link 
                            to="/search" 
                            className="text-blue-500 hover:underline"
                        >
                            Continue Shopping
                        </Link>
                        <div>
                            <div className="text-xl font-bold">
                                Total: ₹{calculateTotal()}
                            </div>
                            <div className="mt-6">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleGenerateOtp}
                >
                    Proceed to Checkout
                </button>
                <div>
                {otps.length > 0 && (
                    <div>
                        <h2>Generated OTP</h2>
                        {otps.map((otpInfo, index) => (
                            <div key={index} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
                                <p className='flex items-center border rounded px-4'><strong>Seller ID : </strong> {otpInfo.sellerID}</p>
                                <p className='flex items-center border rounded px-4' ><strong>Transaction ID : </strong> {otpInfo.transactionID}</p>
                                <p className='flex items-center border rounded px-4'><strong>OTP : </strong> {otpInfo.otp}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;