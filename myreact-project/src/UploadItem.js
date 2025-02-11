import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './UploadItems.css'


const UploadItem = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        sellerId: '',
        category: '',
        description: '',
        negotiable: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        const payload = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            sellerId: formData.sellerId,
            category: formData.category,
            description: formData.description,
            negotiable: formData.negotiable,
        };
        console.log('Sending payload   :', payload);
        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });
            const data = await response.json(); 
            console.log('Upload response:', data);

            if (response.ok) {
                alert('Item uploaded successfully');
                navigate('/search');
            } else {
                //const errorData = await response.json();
                //alert(`Error: ${errorData.message}`);
                alert('Error uploading item' + data.message);
            }
        } catch (err) {
            alert('Error uploading item');
        }
    };

    return (
        <div className="page-container" align="center">
            <Navbar />
            <form onSubmit={handleSubmit} className="form-container">
                <h2>Upload an Item</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Item Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
                <br/>
                <br/>
                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
                 <input
                    type="number"
                    name="stock"
                    placeholder="Quantity"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                />
                <br/>
                <br/>
                <input
                    type="text"
                    name="sellerId"
                    placeholder="Seller ID"
                    value={formData.sellerId}
                    onChange={handleChange}
                    required
                />
                <br/>
                <br/>
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                />
                <br/>
                <br/>
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                />
                <br/>
                <br/>
                <label>
                    Negotiable:
                    <input
                        type="checkbox"
                        name="negotiable"
                        checked={formData.negotiable}
                        onChange={handleChange}
                    />
                </label>
                <br/> 
                <br/>
                <button type="submit" className="button button-primary">Upload</button>
            </form>
        </div>
    );
};

export default UploadItem;
