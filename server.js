const express = require("express");
const app = express();
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;
const userRouter = require("./routes/api/user");
const profileRouter = require("./routes/api/profile");
const postRouter = require("./routes/api/post");
const authRouter = require("./routes/api/auth");

// Connect Database
connectDB();

app.use(express.json({ extended: false }));
// Define Routes
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/post", postRouter);
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
