const express = require("express");
const connectDb = require("./config/dbConnection.js");
const errorHandler = require("./middlewares/errorHandler");
const cors = require("cors");
const dotenv = require("dotenv").config();

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

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});