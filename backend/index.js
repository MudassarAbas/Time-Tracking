const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./Router/UserRouter");
const userDataRoute = require("./Router/UserDataRouter");
const activityRoute = require("./Router/ActivityRouter");
const getTimeSheetRoute = require("./Router/getTimeSheet");
const projectRouter = require("./Router/projectRouter");
const teamRouter = require("./Router/teamRouter");
const screenshotRouter = require("./Router/screenshotRouter");
// const postRoute = require("./Router/post");
const cors = require("cors");
dotenv.config();
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Connection to Database Failed");
  });

app.use(cors());
app.use(express.json());
app.use("/api/user", userRoute);
app.use("/api/put", userDataRoute);
app.use("/api/put", activityRoute);
app.use("/api/timesheet", getTimeSheetRoute);
app.use("/api/project", projectRouter);
app.use("/api/team", teamRouter);
app.use("/api/screenshot", screenshotRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});
