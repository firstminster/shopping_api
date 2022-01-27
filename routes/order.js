const router = require("express").Router();
const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// Create Order:
router.post("/", verifyToken, async (req, res) => {
  // Creates a new Order.
  const newOrder = new Order(req.body);

  try {
    // Save the created Order in the database.
    const savedOrder = await newOrder.save();

    // Returns the data to the client as Json.
    res.status(200).json(savedOrder);
  } catch (error) {
    res.status(500).json(error);
  }
});

// // Admin role only:
// // UPDATE a single Order route:
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //   Set and update the Order data
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    // Returns the updated Order data to client as Json
    res.status(200).json(updatedOrder);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// DELETE Order by ID route:
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);

    // Return an OK status with a message.
    res.status(200).json("Order item has been deleted!");

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// // GET user orders by userID route:
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    // find a user orders by userID.
    const orders = await Order.find({ userid: req.params.userId });

    // Returns the data to the client as Json.
    res.status(200).json(orders);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role:
// GET all users orders:
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    // find all users orders.
    const orders = await Order.find();

    // Returns the data to the client as Json.
    res.status(200).json(orders);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// GET monthly income:
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: {
            $month: "$createdAt",
          },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);

    // Returns the data to the client as Json.
    res.status(200).json(income);
    // res.status(201).send(income);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
