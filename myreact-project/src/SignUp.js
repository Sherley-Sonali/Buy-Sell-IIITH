import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        // Last Name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.endsWith('iiit.ac.in')) {
            newErrors.email = 'Invalid email domain';
        }

        // Phone validation
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Age validation
        const age = parseInt(formData.age);
        if (!formData.age) {
            newErrors.age = 'Age is required';
        } else if (isNaN(age) || age < 17 || age > 120) {
            newErrors.age = 'Please enter a valid age between 17 and 120';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }

        // Confirm Password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


   // SignUp.js - Add console logs to debug data flow
const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        // Log the form data to verify all fields are present
        console.log('Form Data:', formData);

        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            age: parseInt(formData.age),
            password: formData.password
        };

        // Log the payload being sent to the server
        console.log('Sending payload:', payload);

        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                credentials: 'include' // Important for cookies
            });

            const result = await response.json();
            console.log('Signup response:', result);

            if (response.ok) {
                //alert('Signup successful!');
                navigate('/');
            } else {
                alert(`Signup failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('An error occurred. Please try again later.');
        }
    }
};


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const signUp = async (email, password) => {
        const response = await fetch('http://localhost:5000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
      
        const data = await response.json();
        if (response.ok) {
          //alert('Signup successful');
          window.location.href = '/'; // Redirect to login page
        } else {
          alert(data.error);
        }
      };
      
    return (
        <div className="auth-container">
            <div className="decorative-shape-1" />
            <div className="decorative-shape-2" />

            <div className="auth-box">
                <h1 className="auth-title">Create Account</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter your last name"
                        />
                        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Username</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@iiit.ac.in"
                        />
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter 10-digit phone number"
                        />
                        {errors.phone && <div className="error-message">{errors.phone}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="Enter your age"
                        />
                        {errors.age && <div className="error-message">{errors.age}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                    </div>

                    <button type="submit" className="auth-button">
                        Sign Up
                    </button>

                    <div className="auth-links">
                        <span>Already have an account? </span>
                        <a href="/">Log In</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;