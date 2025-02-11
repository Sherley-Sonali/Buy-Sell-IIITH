import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShoppingCart, Search, HeadphonesIcon, Clock, LogOut, Edit2 } from 'lucide-react';
import './profileStyles.css';
import Navbar from './Navbar';

const Profile = () => {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                console.log('Fetching profile data...');
                const response = await fetch('http://localhost:5000/profile', {
                    method: 'GET',
                    credentials: 'include',
                });

                console.log('Profile response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Received profile data:', data);
                    setUserDetails(data);
                } else {
                    const errorData = await response.json();
                    console.error('Profile fetch error:', errorData);
                    showAlert('Please log in to continue', 'error');
                    navigate('/');
                }
            } catch (error) {
                console.error('Profile fetch error:', error);
                showAlert('Failed to fetch profile data', 'error');
            }
        };

        fetchProfile();
    }, [navigate]);

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                window.location.href = 'https://login.iiit.ac.in/cas/logout?service=http://localhost:3000/';
            }
        } catch (error) {
            showAlert('Failed to logout', 'error');
        }
    };

    const handleSave = async () => {
        try {
            const response = await fetch('http://localhost:5000/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userDetails),
            });

            if (response.ok) {
                showAlert('Profile updated successfully', 'success');
                setIsEditing(false);
            } else {
                showAlert('Failed to update profile', 'error');
            }
        } catch (error) {
            showAlert('Error updating profile', 'error');
        }
    };

    return (
        <div className="page-container">
            <Navbar />
            <br/>
            <div className="content-container">
                {alert.show && (
                    <div className={`alert ${alert.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                        {alert.message}
                    </div>
                )}

                <div className="profile-card">
                    <div className="profile-header">
                        <h2 className="profile-title">Your Profile</h2>
                    </div>
                    
                    <div className="profile-content">
                        {isEditing ? (
                            <div>
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={userDetails.firstName}
                                        onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={userDetails.lastName}
                                        onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={userDetails.email}
                                        onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={userDetails.phone}
                                        onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={userDetails.age}
                                        onChange={(e) => setUserDetails({ ...userDetails, age: e.target.value })}
                                    />
                                </div>
                                
                                <div className="button-group">
                                    <button onClick={handleSave} className="button button-primary button-full">
                                        Save Changes
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="button button-secondary button-full">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="profile-info-row">
                                    <span className="profile-info-label">First Name</span>
                                    <span className="profile-info-value">{userDetails.firstName}</span>
                                </div>
                                
                                <div className="profile-info-row">
                                    <span className="profile-info-label">Last Name</span>
                                    <span className="profile-info-value">{userDetails.lastName}</span>
                                </div>

                                <div className="profile-info-row">
                                    <span className="profile-info-label">Email</span>
                                    <span className="profile-info-value">{userDetails.email}</span>
                                </div>

                                <div className="profile-info-row">
                                    <span className="profile-info-label">Phone</span>
                                    <span className="profile-info-value">{userDetails.phone}</span>
                                </div>

                                <div className="profile-info-row">
                                    <span className="profile-info-label">Age</span>
                                    <span className="profile-info-value">{userDetails.age}</span>
                                </div>
                                
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="button button-primary button-full"
                                    style={{ marginTop: '1.5rem' }}
                                >
                                    <Edit2 />
                                    Edit Profile
                                </button>
                            </div>
                        )}
                        
                        <button
                            onClick={handleLogout}
                            className="button button-danger button-full"
                            style={{ marginTop: '1.5rem' }}
                        >
                            <LogOut />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;