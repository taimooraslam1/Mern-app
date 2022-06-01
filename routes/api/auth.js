const express = require("express");
const authRouter = express.Router();
const authMiddleware = require("../../middleware/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtSecret = config.get("jwtSecret");
const User = require("../../models/User");
const { body, validationResult } = require("express-validator");

// @route GET api/auth
// desc   Test Route
// access Public

authRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({ user: user });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// @route Post api/users
// desc   Login Route
// access Public

authRouter.post(
  "/",
  body("email", "Please enter vaild email").isEmail(),
  body("password", "Please enter your password").exists(),
  async (req, res) => {
    //   Validate
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // Check if user already exit
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User with this email not exist" }] });
      }
      // Match Password

      const isMatchPassword = await bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return res.status(400).json({ errors: [{ msg: "invalid password" }] });
      }

      // JWT
      const payload = {
        user: { id: user.id },
      };
      jwt.sign(payload, jwtSecret, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        res.json({ token: token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error: " + err.message);
    }
  }
);

module.exports = authRouter;
