const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const Student = require("./models/student");
const User = require("./models/users");
const Chat = require("./models/chat");
// google oauth
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.YOUR_CLIENT_ID);
// database and env
require("dotenv").config();
mongoose.connect(process.env.DB_URL, (err) => {
  if (err) {
    throw err;
  }
  console.log("database connected");
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const CLIENT_ID = process.env.YOUR_CLIENT_ID;
// routes
app.get("/profile", checkAuthenticated, (req, res) => {
  let user = req.user;
  const newUser = new User({
    email: user.email,
    name: user.name,
  });
  User.findOne({ email: user.email }, (err, result) => {
    if (err) throw err;
    if (result) {
      User.updateOne(
        { email: user.email },
        {
          visits: result.visits + 1,
          when: [
            ...result.when,
            new Date(new Date().getTime() + 330 * 60000).toLocaleString() +
              " @ " +
              req.headers.host,
          ],
        },
        (err, doc) => {
          if (err) throw err;
          console.log("UPDATED = ", doc);
        }
      );
    } else {
      newUser.save();
    }
  });
  res.render("profile", { user: user });
});
app.post("/login", (req, res) => {
  let token = req.body.token;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    const userid = payload["sub"];
  }
  verify()
    .then(() => {
      res.cookie("varun-session-token", token);
      res.send("success");
    })
    .catch(console.error);
});

app.get("/login-error", (req, res) => {
  res.render("error2");
});
app.get("/student/:student_id", (req, res) => {
  Student.findById(req.params.student_id, (err, result) => {
    res.render("details", { student: result });
  });
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.post("/newChat", checkAuthenticated, (req, res) => {
  const sender = req.user.name;
  const msg = req.body.message;
  console.log("the msg was = ", msg);
  const newChat = new Chat({
    sender: sender,
    msg: msg,
  });
  newChat.save((err) => {
    if (err) throw err;
    console.log("new chat added");
  });
  res.redirect("/chat");
});
app.get("/chat", checkAuthenticated, (req, res) => {
  Chat.find({}, (err, result) => {
    res.render("chat", { Chat: result });
  });
});
app.get("/login", (req, res) => {
  res.render("login", { clientid: process.env.YOUR_CLIENT_ID });
});
app.get("/logout", (req, res) => {
  res.clearCookie("varun-session-token");
  res.redirect("/");
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
app.get("/find", (req, res) => {
  res.json({ status: "not yet ready" });
});
app.get("/", (req, res) => {
  res.redirect("/home");
});
app.listen(port, () => console.log("app hosted at", port));

function checkAuthenticated(req, res, next) {
  let token = req.cookies["varun-session-token"];

  let user = {};
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
  }
  verify()
    .then(() => {
      req.user = user;
      next();
    })
    .catch((err) => {
      res.redirect("/login-error");
    });
}
