const router = require("express").Router();
const Cart = require("../models/Cart");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// Create cart:
router.post("/", verifyToken, async (req, res) => {
  // Creates a new cartItem.
  const newCart = new Cart(req.body);

  try {
    // Save the created Cart in the database.
    const savedCart = await newCart.save();

    res.status(200).json(savedCart);
  } catch (error) {
    res.status(500).json(error);
  }
});

//  UPDATE a single cartItem route:
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    //   Set and update the cartItem data
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    // Returns the updated Cart data to client
    res.status(200).json(updatedCart);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE cartItem by ID route:
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);

    // Return an OK status with a message.
    res.status(200).json("Cart item has been deleted!");

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

//  GET user cartItems by userID route:
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    // find a user cartItems by userID.
    const cart = await Cart.findOne({ userid: req.params.userId });

    // Returns the data to the client as Json.
    res.status(200).json(cart);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role:
// GET all users cartItems:
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    // find all users cartItems.
    const carts = await Cart.find();

    // Returns the data to the client as Json.
    res.status(200).json(carts);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
