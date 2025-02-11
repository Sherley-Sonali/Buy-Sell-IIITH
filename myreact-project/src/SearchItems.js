import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import './SearchItems.css';
const CATEGORIES = [
    'Electronics', 'Clothing', 'Furniture', 'Books', 
    'Sports', 'Toys', 'Jewelry', 'Home Decor'
];

const SearchItems = () => {
    const [search, setSearch] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [appliedCategories, setAppliedCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const fetchItems = async () => {
        try {
            const params = new URLSearchParams();
            
            if (search) params.append('name', search);
            
            // Add categories
            appliedCategories.forEach(cat => {
                params.append('categories', cat);
            });

            const response = await fetch(`http://localhost:5000/api/items?${params.toString()}`);
            const data = await response.json();
            
            // Log for debugging
            console.log('Fetch Parameters:', params.toString());
            console.log('Fetched Items:', data);
            
            setItems(data);
        } catch (err) {
            console.error('Error fetching items:', err);
            alert('Error fetching items');
        }
    };

    useEffect(() => {
        fetchItems();
    }, [search, appliedCategories]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(cat => cat !== category)
                : [...prev, category]
        );
    };

    const applyFilters = () => {
        setAppliedCategories(selectedCategories);
        setShowCategoryDropdown(false);
    };

    const removeCategory = (categoryToRemove) => {
        setSelectedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
        setAppliedCategories(prev => prev.filter(cat => cat !== categoryToRemove));
    };

    return (
        <div className="page-container p-6" align="center">
            <Navbar />
            <div className="search-container mb-6">
                <br></br>
                <br></br>
                <br></br><br></br><br></br>
                <input
                    type="text"
                    placeholder="Search by name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                />
                
                <div className="category-filter">
                    <input
                        type="text"
                        placeholder="Select Categories"
                        value={selectedCategories.join(', ')}
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        readOnly
                        className="category-input"
                    />
                    {showCategoryDropdown && (
                        <div className="category-dropdown">
                            {CATEGORIES.map(category => (
                                <div 
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    className={`category-option ${
                                        selectedCategories.includes(category) ? 'selected' : ''
                                    }`}
                                >
                                    {category}
                                </div>
                            ))}
                            <div className="dropdown-actions">
                                <button 
                                    onClick={() => setShowCategoryDropdown(false)}
                                    className="btn btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={applyFilters}
                                    className="btn btn-apply"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Applied Categories */}
                {appliedCategories.length > 0 && (
                    <div className="applied-categories">
                        {appliedCategories.map(category => (
                            <span 
                                key={category} 
                                className="category-tag"
                            >
                                {category}
                                <button 
                                    onClick={() => removeCategory(category)}
                                    className="remove-tag"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Items Display */}
<div className="items-grid">
    {items.map((item) => (
        <Link 
            to={`/items/${item._id}`} 
            key={item._id} 
            className="item-card"
        >
            <span className="category-badge">{item.category}</span>
            <h3 className="item-name">{item.name}</h3>
            <div className="item-divider"></div>
            <p className="item-price">₹{item.price}</p>
        </Link>
    ))}
</div>
        </div>
    );
};

export default SearchItems;