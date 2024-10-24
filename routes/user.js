const router = require("express").Router();
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const nodemailer = require ("nodemailer");
const authenticateToken = require("./auth.js");  // Import authentication middleware

// SIGN UP API
router.post("/sign-up", async (req, res) => {
    const { username, email, password } = req.body;
 
    try {
        // Check if username is provided
        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }
 
        // Check if username length is valid
        if (username.length < 6) {
            return res.status(400).json({ message: "Username should have at least 6 characters" });
        }
 
        // Validate email format
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
 
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
 
        // Validate password strength
        if (!validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol" });
        }
 
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }
 
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
 
        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
 
        await newUser.save();
 
 
        const auth = nodemailer.createTransport({
            service: "gmail",
            secure : true,
            port : 465,
            auth: {
                user: "aarti.panchal@softude.com",
                pass: "xveo dizd kxnm bhxq"
   
            }
        });
   
   
        const receiver = {
            from : "aarti.panchal@softude.com",
            to : newUser.email,
            subject : "Logged In Notification",
            text : "Hello Welcome To Task Management Application"
        };
   
   
        auth.sendMail(receiver, (error, emailResponse) => {
            if(error)
            throw error;
            console.log("success!");
            response.end();
        });
 
 
 
 
 
        return res.status(200).json({ message: "Sign-up successful" });
 
    } catch (error) {
        console.error("Error during sign-in:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
 
// LOGIN API
router.post("/log-in", async (req, res) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }
    bcrypt.compare(password, existingUser.password, (err, data) => {
        if (data) {
            const authClaims = [{ email: email }, { jti: jwt.sign({}, "aarti123") }];
            const token = jwt.sign({ authClaims }, "aarti123", { expiresIn: "2d" });
            res.status(200).json({ id: existingUser._id, token: token });
        } else {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
    });
});
 

// Get all users
router.get('/get-all-users', authenticateToken, async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find({}, '-password'); // Exclude password field
        res.status(200).json({ data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;