const port = 7000;
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");  // Add bcrypt for password hashing
const multer = require("multer");
const cors = require("cors");
app.use(express.json());
app.use(cors());

// Database Connection with MongoDB
mongoose.connect("", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    avatar: {
        type: String,
        default: ""
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, { timestamps: true });

const Users1 = mongoose.model('User1', userSchema);

// Signup Endpoint
app.post('/signup', async (req, res) => {
    try {
        let check = await Users1.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({
                success: false,
                error: "Existing user found with the same email address"
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new Users1({
            name: req.body.username,
            email: req.body.email,
            password: hashedPassword,  // Save hashed password
        });
        await user.save();

        const data = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(data, 'secret_ecom', { expiresIn: '24h' });
        res.json({
            success: true,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    try {
        // Select password field explicitly because it's excluded by default
        let user = await Users1.findOne({ email: req.body.email }).select("+password");

        if (user) {
            // Compare the hashed password with the one in the request
            let passComp = await bcrypt.compare(req.body.password, user.password);
            if (passComp) {
                const data = {
                    user: {
                        id: user.id
                    }
                };
                const token = jwt.sign(data, 'secret_ecom', { expiresIn: '24h' });
                res.json({
                    success: true,
                    token,
                });
            } else {
                res.status(400).json({ success: false, error: "Wrong Password" });
            }
        } else {
            res.status(400).json({ success: false, error: "Wrong email address" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
});

// Default Route
app.get('/', (req, res) => {
    res.send("Express App is Running");
});

// Start the server
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on port: " + port);
    } else {
        console.log("Error: " + error);
    }
});
