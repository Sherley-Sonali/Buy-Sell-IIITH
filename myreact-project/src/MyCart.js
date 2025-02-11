import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyCart = () => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await fetch('http://localhost:5000/cart', {
                    credentials: 'include'
                });
                const data = await response.json();
                setCartItems(data);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        fetchCartItems();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">My Cart</h2>
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <div className="grid gap-4">
                    {cartItems.map((cartItem) => (
                        <Link 
                            to={`/items/${cartItem.item._id}`} 
                            key={cartItem.item._id} 
                            className="border p-4 rounded hover:bg-gray-100 flex justify-between"
                        >
                            <div>
                                <h3 className="font-semibold">{cartItem.item.name}</h3>
                                <p>Quantity: {cartItem.quantity}</p>
                                <p>Price: ${cartItem.item.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCart;