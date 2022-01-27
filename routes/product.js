const router = require("express").Router();
const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// Admin role only:
// Create products:
router.post("/", verifyTokenAndAdmin, async (req, res) => {
  // Creates a new product.
  const newProduct = new Product(req.body);

  try {
    // Save the created product in the database.
    const savedProduct = await newProduct.save();

    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// UPDATE a single product route:
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    //   Set and update the user data
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    // Returns the updated product data to client
    res.status(200).json(updatedProduct);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// DELETE user by ID route:
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    // Return an OK status with a message.
    res.status(200).json("Product has been deleted!");

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET Single product by ID route:
router.get("/find/:id", async (req, res) => {
  try {
    // find product by ID.
    const product = await Product.findById(req.params.id);

    // Returns the data to the client as Json.
    res.status(200).json(product);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET all products:
router.get("/", async (req, res) => {
  // checks for query
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    // Returns the data to the client as Json.
    res.status(200).json(products);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
