const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const Student = require("./models/student");
require("dotenv").config();
mongoose.connect(process.env.DB_URL, (err) => {
  if (err) {
    throw err;
  }
  console.log("database connected");
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.post("/add", (req, res) => {
  const name = req.body.name;
  const company = req.body.company;
  const ctc = req.body.ctc;
  console.log(name, company, ctc);
  res.render("thanks", { name: name });
});
app.get("/add", (req, res) => {
  res.render("addStudent");
});
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/", (req, res) => {
  res.redirect("/home");
});
app.listen(port, () => console.log("app hosted at", port));
