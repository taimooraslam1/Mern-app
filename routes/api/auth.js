const express = require("express");
const authRouter = express.Router();
const authMiddleware = require("../../middleware/auth");

// @route GET api/auth
// desc   Test Route
// access Public

authRouter.get("/", authMiddleware, (req, res) => {
  res.send("Auth api working");
});

module.exports = authRouter;
