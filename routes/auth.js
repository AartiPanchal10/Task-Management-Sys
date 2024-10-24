const jwt = require("jsonwebtoken");
 
// Middleware function to authenticate JWT tokens
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
   
    // Extract token from authorization header
    const token = authHeader && authHeader.split(' ')[1];
 
    if (token == null) {
        // Token is missing
        return res.status(401).json({
            message: 'Authentication token required'
        });
    }
 
    // Verify the token
    jwt.verify(token, 'aarti123', (err, user) => {
       
        if (err) {
            // Token is invalid
            return res.status(403).json({ message: 'Invalid token' });
        }
 
        req.user = user; // Attach user info to request
        next(); // Proceed to next middleware or route handler
    });
}
 
module.exports = authenticateToken;