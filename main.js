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
app.get("/student/:student_id", (req, res) => {
  Student.findById(req.params.student_id, (err, result) => {
    res.render("details", { student: result });
  });
});

app.get("/login", (req, res) => {
  res.render("login", { clientid: process.env.clientid });
  console.log(process.env.clientid);
});
app.post("/add", (req, res) => {
  const name = req.body.name;
  const company = req.body.company;
  const ctc = req.body.ctc;
  const code = req.body.code;
  if (code === process.env.CODE) {
    const newStudent = new Student({
      name: name,
      company: company,
      ctc: ctc + " LPA",
    });
    newStudent.save((err) => {
      if (err) throw err;
      console.log("new student saved");
    });
    console.log(newStudent);
    res.render("thanks", { name: name });
  } else {
    res.render("error1");
  }
});
app.get("/add", (req, res) => {
  res.render("addStudent");
});
app.get("/home", (req, res) => {
  Student.find({}, (err, result) => {
    Student.count({}, (errr, count) => {
      res.render("home", { student: result, size: count });
    });
  });
});
app.get("/", (req, res) => {
  res.redirect("/home");
});
app.listen(port, () => console.log("app hosted at", port));
