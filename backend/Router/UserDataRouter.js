const router = require("express").Router();
const UserData = require("../Modals/UserDataModal");
const dotenv = require("dotenv");
dotenv.config();

router.post("/upload", async (req, res) => {
  const newData = new UserData({
    user: req.body.user,
    screenshot: req.body.screenshot,
    date: req.body.date,
    time: req.body.time,
  });
  data = await newData.save();
  res.status(200).json({
    message: "Data Saved Successfully",
  });
});

module.exports = router;
// Compare this snippet from backend/Router/UserDataRouter.js:
