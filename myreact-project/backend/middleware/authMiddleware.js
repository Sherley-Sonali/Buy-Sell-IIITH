const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwtToken; // Get token from cookie

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = decoded; // Attach user info to request
        next(); // Proceed to next middleware/route
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateUser;
