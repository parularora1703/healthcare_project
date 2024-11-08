/*const express = require("express");
const connectDb = require("./config/dbConnection.js");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const hbs = require("hbs");
const path = require("path");
const multer=require('multer');
const upload=multer({dest: 'uploads/'});

connectDb();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

// rute for registration and authentication
app.use("/api/register", require("../server/routes/userRoutes"));
app.use("/api/details",require("./routes/doctorDetailsRoutes"));

app.use(errorHandler);
app.set('view engine','hbs');


app.get('/', (req, res) => {
    res.send("Working");
})

app.get('/home', (req, res) => {
    res.render("home",{username: "parul"});
})

app.get("/allusers",(req,res) => {
    res.render("users", {
        users:[{id:1,username:"Parul",age:20},
            {id:2,username:"Jiya",age:15}
        ]})
})

app.post('/profile', upload.single('avatar'),function (req,res,next){
    console.log(req.body);
    console.log(req.file);
    return res.redirect("/home")
}),



hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp/my-uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
  
  const uploads = multer({ storage: storage })*/
  const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('./Middleware/errorHandler');
const connectDb = require('./Config/dbconnection');
const cors = require('cors'); // CORS for security at server side
const multer = require('multer');
const File = require('../models/file');
const dotenv = require('dotenv');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDb();

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5000; // Set server port

// Set view engine and views path
hbs.registerPartials(path.join(__dirname, 'views', 'partials'), (err) => {
    if (err) console.error("Error registering hbs partials:", err);
});
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Ensure 'uploads' directory exists, or create it
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Created 'uploads' directory.");
}

// Multer storage configuration with proper encoding
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Directory where files will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date
        
        
        .now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

// Route to render the home page with uploaded files data
app.get('/',(req,res)=>{
    res.send("working");
});
app.get('/home', async (req, res) => {
    try {
        const files = await File.find(); // Fetch all uploaded files from MongoDB
        res.render('home', {
            username: 'Gracy',
            users: [
                { name: 'John Doe', age: 30 },
                { name: 'Jane Smith', age: 25 }
            ],
            files: files // Pass files to the template
        });
    } catch (error) {
        console.error("Error rendering home page:", error);
        res.status(500).send("Error loading home page.");
    }
});

// Route to handle file upload and save metadata to MongoDB
app.post('/profile', upload.single('avatar'), async (req, res) => {
    console.log("Upload endpoint hit"); // Log to verify route access

    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Create a new file record in MongoDB with file metadata
        const fileData = new File({
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            contentType: req.file.mimetype // Store MIME type to handle different file types
        });

        await fileData.save(); // Save metadata to MongoDB
        console.log('File metadata saved:', fileData);
        return res.redirect('/home');
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file.');
    }
});

// Route to serve uploaded files directly
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    fs.stat(filePath, (err, stat) => {
        if (err) {
            console.error("File not found:", err);
            return res.status(404).send("File not found.");
        }
        res.sendFile(filePath); // Serve the file for download or preview
    });
});

// Import and use additional routes
app.use('/api/', require('../routes/userRoutes'));
app.use('/api/details', require('../routes/doctorDetails'));

// Error handling middleware
app.use(errorHandler);

// Start the server and listen for connections
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

// Catch any unhandled exceptions for better debugging
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});