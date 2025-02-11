import React, { useState , useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';


import {jwtDecode} from "jwt-decode";

const YOUR_SITE_KEY = '6LdP8MwqAAAAALa53V1UtGYYs0BsAs-IWXP1mamm';
const loadReCaptchaScript = () => {
    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      console.log('reCAPTCHA already loaded');
      return;
    }
  
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${YOUR_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };
    
    // Add load handling
    script.onload = () => {
      console.log('reCAPTCHA script loaded successfully');
      // Initialize reCAPTCHA after script loads
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA is ready');
      });
    };
    
    document.head.appendChild(script);
  };
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
};



const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [captchaToken, setCaptchaToken] = useState('');

    // Load reCAPTCHA script when component mounts
    useEffect(() => {
        loadReCaptchaScript();
    }, []);

    useEffect(() => {
        const jwtToken = getCookie("jwt");
        console.log("JWT Token:", jwtToken);

        if (!jwtToken) {
            setErrors("Not authenticated");
            return;
        }
        try {
            const decoded = jwtDecode(jwtToken);
            console.log("Decoded Token:", decoded);
            
            if (decoded.id) {
                navigate("/profile"); // Redirect if logged in
            }
        } catch (err) {
            console.error("Invalid Token:", err);
            setErrors("Invalid token. Please log in again.");
        }
    }, [navigate]);


    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!formData.email.endsWith('iiit.ac.in')) {
            newErrors.email = 'Invalid email domain';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const executeRecaptcha = async () => {
        console.log('Executing reCAPTCHA...'); // Debug log
        try {
            // Make sure grecaptcha is loaded and ready
            if (!window.grecaptcha) {
                throw new Error('reCAPTCHA not loaded');
            }
    
            // Wait for grecaptcha to be ready
            await new Promise((resolve) => {
                if (window.grecaptcha.ready) {
                    window.grecaptcha.ready(resolve);
                } else {
                    resolve(); // Proceed if .ready is not available
                }
            });
    
            const token = await window.grecaptcha.execute(YOUR_SITE_KEY, { 
                action: 'submit'
            });
    
            console.log('Token generated:', token); // Debug log
            setCaptchaToken(token);
            return token;
        } catch (error) {
            console.error('reCAPTCHA error:', error);
            setErrors(prev => ({ ...prev, captcha: 'reCAPTCHA verification failed' }));
            return null;
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();

        const recaptchaToken = await executeRecaptcha();
        if (!recaptchaToken) return;
        console.log("Reached");
        const { email, password } = formData;
        if (!validateForm()) return;
        // Prepare the data
        console.log("Reached2");
        const payload = { email, password, recaptchaToken };

        try {
            console.log("Reached3");
            const response = await fetch('http://localhost:5000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log('Result:', result);
            
            if (response.ok) {
                //alert('Login successful!');
                console.log('Result:', result);
                //console.log('User:', result.user);
                // Redirect to profile or dashboard
                navigate('/profile'); // Adjust the route as per your app
            } else {
                if (result.message === 'User not found') {
                    alert('User not found. Redirecting to signup...');
                    navigate('/signup'); // Redirect to the signup page
                } else {
                    alert(`Login failed: ${result.message}`);
                }
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('An error occurred. Please try again later.');
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    //     const login = async (email, password) => {
    //     const response = await fetch('http://localhost:5000/', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({ email, password }),
    //       credentials: 'include', // Send cookies with the request
    //     });
      
    //     const data = await response.json();
    //     if (response.ok) {
    //       alert('Login successful');
    //       window.location.href = '/profile'; // Redirect to profile page
    //     } else {
    //       alert(data.error);
    //     }
    //   };
    const handleCASLogin = () => {
        window.location.href = `https://login.iiit.ac.in/cas/login?service=${encodeURIComponent('http://localhost:5000/auth/cas/callback')}`;
    };
    
    return (
        <div >
        <div className="auth-container">
            <div className="decorative-shape-1" />
            <div className="decorative-shape-2" />

            <div className="auth-box">
                <h1 className="auth-title">Welcome Back</h1>
                <button className='auth-Button' onClick={handleCASLogin}>Login with CAS</button>
                <br></br>

                <form onSubmit={handleSubmit}>
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
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>
                    {errors.captcha && <div className="error-message">{errors.captcha}</div>}
                    <button type="submit" className="auth-button">
                        Log In
                    </button>

                    <div className="auth-links">
                        <a href="/forgot-password">Forgot Password?</a>
                        <br />
                        <span>Don't have an account? </span>
                        <a href="/signup">Sign Up</a>
                    </div>
                </form>
            </div>
 

        </div>

  
    </div>
    );
}

export default Login;