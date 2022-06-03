const express = require("express");
const postRouter = express.Router();
const authMiddleware = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

// @route GET api/post
// desc   Test Route
// access Public

postRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST api/post
// desc   Add new post
// access Private

postRouter.post(
  "/",
  authMiddleware,
  body("text", "Text is required").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });
      const post = await newPost.save();
      res.status(200).json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route POST api/post
// desc   Add new post
// access Private

postRouter.get("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    console.log(err.kind);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ message: "Post not found" });
    }
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = postRouter;
