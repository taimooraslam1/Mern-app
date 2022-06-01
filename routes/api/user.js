const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtSecret = config.get("jwtSecret");
const { body, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route GET api/users
// desc   Test Route
// access Public

router.get("/", (req, res) => {
  res.send("user api working");
});

// @route Post api/users
// desc   Test Route
// access Public

router.post(
  "/",
  body("name", "Please enter your name").not().isEmpty(),
  body("email", "Please enter vaild email").isEmail(),
  body("password", "mimimum 6 lenth password required").isLength({ min: 6 }),
  async (req, res) => {
    //   Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      // Check if user already exit
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exits" }] });
      }

      // Create avatar
      const avatar = gravatar.url(email, { s: "200", r: "pg", d: "mm" });

      //   initialize user
      user = new User({ name, email, password, avatar });

      // Password encryption
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      // JWT
      const payload = {
        user: { id: user.id },
      };
      jwt.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token: token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error: " + err.message);
    }
  }
);

module.exports = router;
