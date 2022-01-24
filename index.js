const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");

//
dotenv.config();

// Connects the client to the Mongo database
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB Connection Successfull!"))
  .catch((err) => console.log(err));

// Middlewares
app.use(express.json());

// User routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);

// Products route
app.use("/api/products", productRoute);

// Initiates environment to  listen to server running at port 5000
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running");
});
