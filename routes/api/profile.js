const express = require("express");
const profileRouter = express.Router();

// @route GET api/profile
// desc   Test Route
// access Public

profileRouter.get("/", (req, res) => {
  res.send("Profile api working");
});

module.exports = profileRouter;
