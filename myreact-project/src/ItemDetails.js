import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './ItemsDetails.css';
const ItemDetails = () => {
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(0);
    const { id } = useParams();

    useEffect(() => {
        const fetchItemDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/items/${id}`);
                const data = await response.json();
                setItem(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching item details:', error);
                setLoading(false);
            }
        };

        fetchItemDetails();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            const response = await fetch('http://localhost:5000/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important for sending cookies
                body: JSON.stringify({
                    itemId: id,
                    quantity: quantity
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Added ${quantity} ${item.name} to cart`);
            } else {
                alert(`Error: ${data.error || 'Could not add item to cart'}`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add item to cart');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!item) {
        return <div className="text-center text-red-500">Item not found</div>;
    }

    return (
        <div className="item-details-container">
            <Navbar />
            {/* Item Image Placeholder */}
            <div className="item-details-grid">
                <div className='item-image-container'>
                <span className="item-image-placeholder">Item Image</span></div>
            </div>

            {/* Item Details */}
            <div className="item-info">
                <div className='item-header'>
                    <h1 className="item-title">{item.name}</h1>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="details-card">
                    <h2 className="details-card-title">Item Details</h2>
                    <div className="details-list">
                    <div className="detail-item">
                            <span className="detail-label">Category</span>
                            <span className="detail-value">{item.category}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Description</span>
                            <span className="detail-value">{item.description}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Stock</span>
                            <span className={`stock-indicator ${item.stock > 10 ? 'in-stock' : 'low-stock'}`}>
                                {item.stock} available
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center border rounded">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="quantity-btn"
                        >
                            -
                        </button>
                        <span className="quantity-value">{quantity}</span>
                        <button 
                            onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                            className="quantity-btn"
                        >
                            +
                        </button>
                    </div>
                    <button 
                        onClick={handleAddToCart}
                       className="add-to-cart-btn"
                    >
                        Add to Cart
                    </button>
                </div>

                {/* Seller Information */}
                <div className="details-card">
                    <h2 className="details-card-title">Seller Information</h2>
                    <div className="details-list">
                        <div className="detail-item">
                            <span className="detail-label">Seller ID</span>
                            <span className="detail-value">{item.sellerId || 'Not Available'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;