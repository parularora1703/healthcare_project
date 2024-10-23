const express = require("express");
const connectDb = require("./config/dbConnection.js");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const dotenv = require("dotenv").config();
const hbs = require("hbs");
const path = require("path");

connectDb();
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
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

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});