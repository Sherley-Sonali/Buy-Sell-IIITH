const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require("express-session");

const axios = require('axios');
const xml2js = require('xml2js');


require('dotenv').config(); // Load environment variables
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authenticateUser = require('../backend/middleware/authMiddleware');
 // Import OpenAI first

const http = require('http');
const socketIo = require('socket.io');

const router = express.Router();

const app = express();
const server = http.createServer(app);
app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true, // Allow cookies to be sent
  }));
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:5000 https://www.google.com https://www.gstatic.com");
    next();
});
const CAS_SERVICE = 'http://localhost:5000/auth/cas/callback';
const CAS_URL = 'https://login.iiit.ac.in/cas';


// Socket.IO setup with CORS
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New client connected');
  
    // Chat message event handler
    socket.on('chat message', async (message, callback) => {
        try {
            console.log('Received message:', message);
  
            // Initialize the model
            const model = genAI.getGenerativeModel({ model: "gemini-pro"});
            
            // Generate response
            const result = await model.generateContent(message);
            const response = result.response.text();
            
            console.log('AI Response:', response);
  
            // Use callback to send response back to client
            if (callback && typeof callback === 'function') {
                callback(response);
            }
        } catch (error) {
            console.error('Error processing message:', error);
            
            // Send error response
            if (callback && typeof callback === 'function') {
                callback('Sorry, I encountered an error processing your message.');
            }
        }
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});
  
// server.listen(5000, () => console.log('Server running on port 5000'));


// MongoDB connection
const uri = 'mongodb+srv://sherley21vizag:ImI86UEvJ84FmReM@cluster0.u4tto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));
    const userSchema = new mongoose.Schema({
        firstName: { 
            type: String, 
            required: true,
            default: 'User_firstname',
            trim: true
        },
        lastName: { 
            type: String, 
            required: true,
            default: 'User_lastname',
            trim: true
        },
        email: { 
            type: String, 
            required: true, 
            unique: true,
            lowercase: true
        },
        phone: { 
            type: String, 
            required: true,
            default: 'N/A',
            trim: true
        },
        age: { 
            type: Number, 
            required: true,
            default:17,
            min: [17, 'Age must be at least 17'],
            max: [120, 'Age cannot be more than 120']
        },
        password: { 
            type: String, 
            required: true ,
            default: 'N/A',
        },
        cart: [{
            item: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Item'
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, 'Quantity must be at least 1']
            }
        }]
    }, 
    { 
        timestamps: true
    });
    
    // Add a pre-save validation hook
    userSchema.pre('save', function(next) {
        console.log('Saving user with data:', this);
        next();
    });
    
    const User = mongoose.model('User', userSchema);
    
// Define Item Schema
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'Stock cannot be negative'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    sellerId: {
        type: String,
        ref: 'User',
        required: true
    },    
});


itemSchema.pre('save', function(next) {
    console.log('Saving item with data:', this);
    next();
});

const Item = mongoose.model('Item', itemSchema);

const transactionSchema = new mongoose.Schema({
    transactionID: { type: String, required: true },
    buyerID: { type: String, required: true },
    sellerID: { type: String, required: true },
    amount: { type: Number, required: true },
    otp: { type: String, required: true }, // OTP will be stored as a hashed string
    isCompleted: { type: Boolean, default: false }, // New field for transaction status
    itemIDs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }] // Array of item IDs involved
});

transactionSchema.pre('save', function(next) {
    console.log('Saving transaction with data:', this);
    next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);


app.get('/auth/cas', (req, res) => {
    const casLoginURL = `${CAS_URL}/login?service=${encodeURIComponent(CAS_SERVICE)}`;
    res.redirect(casLoginURL);
});

// Handle CAS callback and validate ticket
app.get('/auth/cas/callback', async (req, res) => {
    const { ticket } = req.query;

    if (!ticket) {
        return res.status(400).json({ error: 'Missing CAS ticket' });
    }

    try {
        // Step 1: Validate CAS ticket
        const casResponse = await axios.get(`${CAS_URL}/serviceValidate`, {
            params: { service: CAS_SERVICE, ticket }
        });

        // Step 2: Parse CAS XML response
        const parsedData = await xml2js.parseStringPromise(casResponse.data, { explicitArray: false });
        console.log('CAS Response:', parsedData);

        const userEmail = parsedData['cas:serviceResponse']?.['cas:authenticationSuccess']?.['cas:user'];

        if (!userEmail) {
            return res.status(401).json({ error: 'CAS authentication failed' });
        }

        // Step 3: Check if user exists, else create a new one
        let user = await User.findOne({ email: userEmail });
        if (!user) {
            user = new User({ email: userEmail, firstName: 'CAS', lastName: 'User' });
            await user.save();
        }

        // Step 4: Generate JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Step 5: Store token in a cookie and redirect
        res.cookie('jwt', token, { httpOnly: true, secure: false });
        res.redirect('http://localhost:3000/profile'); // Redirect to frontend

    } catch (error) {
        console.error('CAS Authentication Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Helper function to generate a random OTP
const generateRandomOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};
// Helper function to create JWTs
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' }, { sameSite: 'none' });
  };

app.post('/signup', async (req, res) => {
    console.log('Full request body:', req.body);

    const { firstName, lastName, email, phone, age, password } = req.body;

    // Explicitly log each field
    console.log('Received fields:', {
        firstName,
        lastName,
        email,
        phone,
        age,
        passwordLength: password ? password.length : 'No password'
    });

    try {
        // Explicitly create user with all fields
        const newUser = new User({
            firstName: firstName || '',
            lastName: lastName || '',
            email,
            phone: phone || '',
            age: parseInt(age) || 0,
            password: await bcrypt.hash(password, 10)
        });

        // Log the user object before saving
        console.log('User object to be saved:', newUser.toObject());

        // Save the user and log any errors
        await newUser.save()
            .then(savedUser => {
                console.log('User saved successfully:', savedUser);
                res.status(201).json({ message: 'User created successfully' });
            })
            .catch(saveError => {
                console.error('Error saving user:', saveError);
                // Log validation errors
                if (saveError.name === 'ValidationError') {
                    const errors = Object.values(saveError.errors).map(err => err.message);
                    res.status(400).json({ 
                        message: 'Validation Error', 
                        errors 
                    });
                } else {
                    res.status(500).json({ 
                        message: 'Server error', 
                        error: saveError.message 
                    });
                }
            });

    } catch (error) {
        console.error('Signup process error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Profile endpoint with detailed logging
app.get('/profile', async (req, res) => {
    console.log('Profile request received');
    console.log('Cookies received:', req.cookies);

    const token = req.cookies.jwt;
    if (!token) {
        console.log('No JWT token found');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.id);
        console.log('Found user:', user);

        if (!user) {
            console.log('No user found for id:', decoded.id);
            return res.status(404).json({ error: 'User not found' });
        }

        // Send all user details
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            age: user.age
        };

        console.log('Sending user data:', userData);
        res.json(userData);
    } catch (error) {
        console.error('Error in profile:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Update the profile PUT endpoint to handle all fields
app.put('/profile', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Update all fields
        const { firstName, lastName, email, phone, age } = req.body;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.age = age || user.age;

        await user.save();
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// In backend
const verifyRecaptcha = async (token) => {
    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${YOUR_RECAPTCHA_SECRET_KEY}&response=${token}`,
      });
      
      const data = await response.json();
      
      // Check the score and take action accordingly
      if (data.success && data.score > 0.5) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  };

// Login endpoint
app.post('/', async (req, res) => {
    console.log('Full request body:', req.body);
    const { email, password , recaptchaToken} = req.body;
    console.log('Recaptcha token:', recaptchaToken);
   const ver = verifyRecaptcha(recaptchaToken);
    console.log('Recaptcha verification:', ver);
    try {
        // Find user
        const user = await User.findOne({ email });
        //alert('User found');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken(user._id); // Generate JWT
        //console.log('Generated JWT:', token); // Log the token

        res.cookie('jwt', token, {
            httpOnly: false, 
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            sameSite: 'none', // Adjust as needed: 'strict', 'lax', or 'none'
            secure: true,
          });
          
        //res.cookie('jwt', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // Set JWT cookie
        //res.json({ message: 'Login successful' });
        res.json({  token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.post('/upload', async (req, res) => {
    console.log('Full request body:', req.body);

    const {name, description, price, category, stock, sellerId } = req.body;

    // Explicitly log received fields
    console.log('Received fields:',{name, price,sellerId, category, description });
    console.log('Typeof sellerId:', typeof sellerId);

    try {

       // const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Explicitly create item with all fields
        const newItem = new Item({
            name: name || '',
            price: parseFloat(price) || 0,
            stock :parseFloat(stock)||0,
            sellerId: sellerId || '',
            category: category || 'Uncategorized',
            //stock: parseInt(stock) || 0,
            description: description || '',
        });

        // Log the item object before saving
        console.log('Item object to be saved:', newItem.toObject());

        // Save the item and log any errors
        await newItem.save()
            .then(savedItem => {
                console.log('Item saved successfully:', savedItem);
                res.status(201).json({ message: 'Item created successfully' });
            })
            .catch(saveError => {
                console.error('Error saving item:', saveError);
                // Log validation errors
                if (saveError.name === 'ValidationError') {
                    const errors = Object.values(saveError.errors).map(err => err.message);
                    res.status(400).json({ 
                        message: 'Validation Error', 
                        errors 
                    });
                } else {
                    res.status(500).json({ 
                        message: 'Server error', 
                        error: saveError.message 
                    });
                }
            });

    } catch (error) {
        console.error('Add item process error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});
app.get('/api/items', async (req, res) => {
    try {
        console.log('Request received at /api/items');
        console.log('Query params:', req.query);
        const { name, categories } = req.query;
        
        const query = {};
        
        // Name search (case-insensitive)
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        
        // Category filtering
        if (categories) {
            // Ensure categories is always an array
            const categoryList = Array.isArray(categories) ? categories : [categories];
            
            // Exact match for category
            query.category = { $in: categoryList };
        }
        
        // Log the query for debugging
        console.log('MongoDB Query:', query);
        
        // Find items matching the query
        const items = await Item.find(query);
        
        console.log('Found Items:', items);
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error searching items', error: error.message });
    }
});

// Add item to cart
app.post('/cart/add', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { itemId, quantity } = req.body;
        const item = await Item.findById(itemId);

        if (!item) return res.status(404).json({ error: 'Item not found' });
        console.log('Item:', item.sellerId);
        console.log('User:', user.email.toString());
        if (item.sellerId === user.email.toString()) {
            console.log("same user");
            return res.status(400).json({ error: 'Cannot add own item to cart' });
        }
        // Check if item already in cart
        const cartItemIndex = user.cart.findIndex(
            cartItem => cartItem.item.toString() === itemId
        );

        if (cartItemIndex > -1) {
            // Update quantity if item exists
            user.cart[cartItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            user.cart.push({ 
                item: itemId, 
                quantity: quantity 
            });
        }

        await user.save();
        res.json({ message: 'Item added to cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Remove item from cart
app.post('/cart/remove', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const { itemId } = req.body;
        user.cart = user.cart.filter(
            cartItem => cartItem.item.toString() !== itemId
        );

        await user.save();
        res.json({ message: 'Item removed from cart', cart: user.cart });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});


app.get('/cart', async (req, res) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).populate({
            path: 'cart.item',
            model: 'Item'  // Explicitly specify the model
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Log the populated cart to debug
        console.log('Populated Cart:', JSON.stringify(user.cart, null, 2));

        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Get item details
app.get('/api/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching item', error: err });
    }
});

app.post('/api/generate-otp', async (req, res) => {
    const { buyerID, amount } = req.body;

    try {
        const buyer = await User.findById(buyerID);
        if (!buyer) {
            return res.status(404).json({ message: 'Buyer not found.' });
        }

        console.log('Populated Cart:', JSON.stringify(buyer.cart, null, 2));
        const itemIds = [...new Set(buyer.cart.map(cartItem => cartItem.item._id))];
        console.log('Item Ids:', itemIds);

        const uniqueSellerIds = await Item.find({ '_id': { $in: itemIds } }).distinct('sellerId');
        console.log('Unique Seller Ids:', uniqueSellerIds);

        if (uniqueSellerIds.length === 0 || !amount) {
            return res.status(400).json({ message: 'No sellers found or amount is missing.' });
        }
        const otp = generateRandomOtp(); // Generate OTP for the seller
            const hashedOtp = await bcrypt.hash(otp, 10);

        const otpResponses = [];
        for (const sellerID of uniqueSellerIds) {
            

            // Create a transaction for this seller
            const transaction = new Transaction({
                transactionID: new mongoose.Types.ObjectId().toString(),
                buyerID,
                sellerID,
                amount,
                otp: hashedOtp,
                isCompleted: false, // Initially set to 
                itemIDs: itemIds,
            });

            await transaction.save();

            // Save plain OTP for frontend response
            otpResponses.push({
                sellerID,
                transactionID: transaction.transactionID,
                otp, // Plain OTP for frontend
            });
        }

        res.status(201).json({
            message: 'OTPs generated successfully.',
            otps: otpResponses,
        });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Failed to generate OTPs.' });
    }
});


// Verify OTP
app.post('/transaction/verify-otp', async (req, res) => {
    const { transactionId, otp } = req.body;
    
    try {
        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        const isMatch = await bcrypt.compare(otp, transaction.otp.hash);
        
        if (isMatch) {
            transaction.status = 'COMPLETED';
            await transaction.save();
            res.json({ message: 'Transaction Completed' });
        } else {
            transaction.otp.attempts += 1;
            await transaction.save();
            res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Regenerate OTP
app.post('/transaction/regenerate-otp', async (req, res) => {
    const { transactionId } = req.body;
    
    try {
        const transaction = await Transaction.findById(transactionId);
        
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOtpHash = await bcrypt.hash(newOtp, 10);
        
        transaction.otp = {
            hash: newOtpHash,
            attempts: 0,
            createdAt: new Date()
        };
        
        await transaction.save();
        
        res.json({ transactionId: transaction._id, message: 'New OTP Generated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/pending-deliveries/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        console.log('Seller ID:', sellerId);

        const seller_Mail = await User.findById(sellerId);
        if (!seller_Mail) {
            return res.status(404).json({ message: 'Seller not found' });
        }
        console.log('Seller:', seller_Mail);

        // Find all incomplete transactions for this seller
        const pendingDeliveries = await Transaction.find({
            sellerID: seller_Mail.email, // Ensure sellerID is stored as an email
            isCompleted: false
        }).select('_id'); // Selecting only transaction IDs initially

        console.log('Pending Deliveries:', pendingDeliveries);

        // Fetch full transaction details and populate buyerID & itemIDs
        const pendingDeliveriesWithDetails = await Promise.all(
            pendingDeliveries.map(async (delivery) => {
                const transaction = await Transaction.findById(delivery._id)
                    .populate({
                        path: 'buyerID', 
                        model: 'User', 
                        select: '_id email' // Select both buyerID and email
                    })
                    .populate({
                        path: 'itemIDs',
                        model: 'Item',
                        select: 'name price description category' // Select necessary fields
                    });

                if (!transaction) {
                    console.error('Transaction not found for ID:', delivery._id);
                    return null;
                }

                return {
                    buyerID: transaction.buyerID._id, // Now includes buyer's ID
                    buyerEmail: transaction.buyerID.email, // Extract buyer's email
                    items: transaction.itemIDs.map(item => ({
                        id: item._id,
                        name: item.name,
                        price: item.price,
                        description: item.description,
                        category: item.category
                    })
        ),
                    transactionId: transaction._id,
                };
            })
        );

        // Remove null values (if any transaction lookup failed)
        const filteredDeliveries = pendingDeliveriesWithDetails.filter(d => d !== null);

        console.log('Pending Deliveries with Details:', JSON.stringify(filteredDeliveries, null, 2));
        res.json(filteredDeliveries);
    } catch (error) {
        console.error('Error fetching pending deliveries:', error);
        res.status(500).json({ message: 'Failed to fetch pending deliveries' });
    }
});

// Verify delivery OTP
app.post('/verify-delivery', async (req, res) => {
    try {
        const { transactionId, otp } = req.body;
        console.log('Transaction ID:', transactionId);
        console.log('OTP:', otp);

        // Find the transaction
        const transaction = await Transaction.findById(transactionId);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Verify OTP (you'll need to implement the actual OTP verification logic)
        // Decrypt the OTP and compare with the input
        const isValidOTP = await bcrypt.compare(otp, transaction.otp);
        console.log('Is Valid OTP:', isValidOTP);
        if (!isValidOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Mark transaction as completed
        transaction.isCompleted = true;
        await transaction.save();

        res.json({ message: 'Delivery verified successfully' });
    } catch (error) {
        console.error('Error verifying delivery:', error);
        res.status(500).json({ message: 'Failed to verify delivery' });
    }
});

// Get pending orders (orders where OTP is generated but delivery isn't completed)
app.get('/pending-orders/:userId', async (req, res) => {
    try {
        console.log('Fetching pending orders for user:', req.params.userId);
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('User found:', user.email);
        const pendingOrders = await Transaction.find({
            buyerID: user._id,
            isCompleted: false
        }).populate('itemIDs');
        console.log('Pending orders retrieved:', pendingOrders.length);

        const formattedOrders = pendingOrders.map(order => ({
            _id: order._id,
            items: order.itemIDs.map(item => ({
                name: item.name,
                price: item.price
            })),
            sellerId: order.sellerID,
            otp: order.otp
        }));

        console.log('Formatted pending orders:', formattedOrders);
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ message: 'Failed to fetch pending orders' });
    }
});

// Get bought orders (completed transactions where user is buyer)
app.get('/bought-orders/:userId', async (req, res) => {
    try {
        console.log('Fetching bought orders for user:', req.params.userId);
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const boughtOrders = await Transaction.find({
            buyerID: user._id,
            isCompleted: true
        }).populate('itemIDs');
        console.log('buyerID:', user.email);
        console.log('Bought orders retrieved:', boughtOrders.length);

        const formattedOrders = boughtOrders.map(order => ({
            _id: order._id,
            items: order.itemIDs.map(item => ({
                name: item.name,
                price: item.price
            })),
            sellerId: order.sellerID,
            otp: order.otp
        }));

        console.log('Formatted bought orders:', formattedOrders);
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching bought orders:', error);
        res.status(500).json({ message: 'Failed to fetch bought orders' });
    }
});

// Get sold orders (completed transactions where user is seller)
app.get('/sold-orders/:userId', async (req, res) => {
    try {
        console.log('Fetching sold orders for user:', req.params.userId);
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        const soldOrders = await Transaction.find({
            sellerID: user.email,
            isCompleted: true
        }).populate('itemIDs');
        console.log('Sold orders retrieved:', soldOrders.length);

        const formattedOrders = soldOrders.map(order => ({
            _id: order._id,
            items: order.itemIDs.map(item => ({
                name: item.name,
                price: item.price
            })),
            buyerId: order.buyerID,
            otp: order.otp
        }));

        console.log('Formatted sold orders:', formattedOrders);
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching sold orders:', error);
        res.status(500).json({ message: 'Failed to fetch sold orders' });
    }
});



  // Logout Route
app.post('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 }); // Expire the cookie
    res.json({ message: 'Logout successful' });
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
server.listen(5001, () => {
    console.log(`Server running on http://localhost:${5001}`);
});