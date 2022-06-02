const express = require("express");
const profileRouter = express.Router();
const authMiddleware = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");

const User = require("../../models/User");
const Profile = require("../../models/Profile");

// @route GET api/profile
// desc   GET all profile
// access Public

profileRouter.get("/", async (req, res) => {
  try {
    let profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET api/profile/user/:user_id
// desc   GET profile by user_id
// access Public

profileRouter.get("/user/:user_id", async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.params.user_id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ message: "Profile not found" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ message: "Profile not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route Delete api/profile
// desc   Delete profile and user
// access Public

profileRouter.delete("/", authMiddleware, async (req, res) => {
  try {
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: "Profile and user deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET api/profile/me
// desc   API to get current user profile
// access private

profileRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res
        .status(400)
        .json({ message: "Profile not found for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// @route POST api/profile/
// desc   Create and update user profile
// access private

profileRouter.post(
  "/",
  authMiddleware,
  body("status", "Please enter user status").not().isEmpty(),
  body("skills", "kindly add user skills").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubuser,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    // if (githubuser) profileFields.githubuser = githubuser;
    // skills convert into array according to model fields
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    // console.log(skills);
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json(profile);
      }
      profile = await Profile(profileFields);
      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route Put api/profile/experience
// desc   Add experience into user profile
// access private

profileRouter.put(
  "/experience",
  authMiddleware,
  body("title", "Please enter your experience title").not().isEmpty(),
  body("company", "Please enter your company name").not().isEmpty(),
  body("from", "Please enter your from date").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.status(200).send(profile);
    } catch (error) {
      res.status(500).send("Server Error");
    }
  }
);

// @route Delete api/profile/experience/:exp_id
// desc   delete experience from user profile
// access private

profileRouter.delete(
  "/experience/:exp_id",
  authMiddleware,
  async (req, res) => {
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      const removeIndex = profile.experience
        .map((exp) => exp.id)
        .indexOf(req.params.exp_id);
      if (removeIndex === -1) {
        return res
          .status(400)
          .json({ message: "Experience with this id not exist" });
      }
      profile.experience.splice(removeIndex, 1);
      await profile.save();
      res.status(200).send(profile);
    } catch (error) {
      res.status(500).send("Server Error");
    }
  }
);

// @route Put api/profile/education
// desc   Add education into user profile
// access private

profileRouter.put(
  "/education",
  authMiddleware,
  body("school", "Please enter your School name").not().isEmpty(),
  body("degree", "Please enter your degree name").not().isEmpty(),
  body("fieldofstudy", "Please enter your Field of Study").not().isEmpty(),
  body("from", "Please enter your from date").not().isEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.status(200).send(profile);
    } catch (error) {
      res.status(500).send("Server Error");
    }
  }
);

// @route Delete api/profile/education/:edu_id
// desc   delete education from user profile
// access private

profileRouter.delete("/education/:edu_id", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map((exp) => exp.id)
      .indexOf(req.params.edu_id);
    if (removeIndex === -1) {
      return res
        .status(400)
        .json({ message: "Education with this id not exist" });
    }
    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.status(200).send(profile);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

module.exports = profileRouter;
