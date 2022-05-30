const express = require("express");
const postRouter = express.Router();

// @route GET api/post
// desc   Test Route
// access Public

postRouter.get("/", (req, res) => {
  res.send("post api working");
});

module.exports = postRouter;
