const router = require("express").Router();
const User = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// Authorize user token middleware:
// UPDATE a single user route:
router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  // Checks for the user password and then encrypt.
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    //   Set and update the user data
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );

    // Returns the updated user data to client
    res.status(200).json(updatedUser);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Authorize user token middleware:
// DELETE user by ID route:
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted!");

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// GET Single user by ID route:
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    // Ommit the password and return other properties in the user object.
    const { password, ...others } = user._doc;

    // Returns the data to the client as Json.
    res.status(200).json(others);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// GET all users:
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  // checks for query if new is true
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();

    // Returns the data to the client as Json.
    res.status(200).json(users);

    // Catch error
  } catch (error) {
    res.status(500).json(error);
  }
});

// Admin role only:
// GET user stats:
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  // get the number of users joined in the last year.
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: {
            $month: "$createdAt",
          },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    // Returns the data to the client as Json.
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
