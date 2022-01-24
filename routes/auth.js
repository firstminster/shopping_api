const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER User route:
router.post("/register", async (req, res) => {
  // Creates a new user & encrypt password.
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    //   Save the created user in the database.
    const savedUser = await newUser.save();

    // Returns the saved user to the client as Json.
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN User route:
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    !user && res.status(401).json("Wrong credentials!");

    // Decrypt pasword using the CryptoJs method
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );

    // Convert hashed password to string
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    // Check if the users(clients) password matches the password returned from the db
    Originalpassword !== req.body.password &&
      res.status(401).json("Wrong credentials!");

    //   JWT fo authorisation
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    // Ommit the password and return other properties in the user object.
    const { password, ...others } = user._doc;

    // Returns the data to the client as Json.
    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
