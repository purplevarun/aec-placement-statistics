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
app.post("/delete/:ID", (req, res) => {
  const code = req.body.code;
  if (code == process.env.CODE) {
    const ID = req.params.ID;
    Student.findByIdAndDelete(ID, (err, result) => {
      if (err) {
        console.log("err=", err);
        res.render("student_not_deleted");
      } else res.render("student_deleted");
    });
  } else {
    console.log("wrong password while deletion");
    res.render("student_not_deleted");
  }
});
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
    time: new Date(new Date().getTime() + 330 * 60000).toLocaleString(),
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
      ctc: ctc,
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
app.get("/home/:sorter", (req, res) => {
  const sorter = {};
  sorter[req.params.sorter] = "asc";
  Student.find({})
    .sort(sorter)
    .exec((err, result) => {
      Student.count({}, (errr, count) => {
        res.render("home", { student: result, size: count });
      });
    });
});
app.get("/find", (req, res) => {
  res.render("findBy");
});
app.post("/findbycompany", (req, res) => {
  const selected_company = req.body.company;
  if (!selected_company) {
    Student.find({}, (err, result) => {
      res.render("findbycompany", {
        student: result,
        error: "Please select a company",
      });
    });
  } else {
    Student.find({ company: selected_company }, (err, result) => {
      Student.count({ company: selected_company }, (errr, count) => {
        res.render("findbycompanyResults", {
          student: result,
          count: count,
          selected_company: selected_company,
        });
      });
    });
  }
});
app.get("/findbyname", (req, res) => {
  res.render("findbyname");
});
app.post("/findbyname", (req, res) => {
  const name = req.body.name;
  Student.find({ name: name }, (err, result) => {
    res.render("findbynameResults", { student: result });
  });
});
app.get("/findbycompany", (req, res) => {
  Student.find({}, (err, result) => {
    res.render("findbycompany", {
      student: result,
      error: null,
    });
  });
});
function reverseString(str) {
  return str.split("").reverse().join("");
}
app.get("/kedia", (req, res) => {
  Student.find({}, (err, docs) => {
    docs.forEach((doc) => {
      var newctc = parseFloat(doc.ctcInt);
      console.log(newctc);
      Student.updateOne(
        { _id: doc._id },
        {
          ctc: newctc,
        },
        (error, result) => {
          console.log(result);
        }
      );
    });
  });
  res.send("bye");
});
app.get("/varun", (req, res) => {
  Student.find({}, (err, docs) => {
    docs.forEach((doc) => {
      var ctc = doc.ctc;
      console.log("old= ", ctc);
      ctc = reverseString(ctc);
      ctc = ctc.substring(4);
      ctc = reverseString(ctc);
      ctc = parseFloat(ctc);
      console.log("new= ", ctc);
      Student.updateOne(
        { _id: doc._id },
        {
          ctcInt: ctc,
        },
        (error, result) => {
          console.log(result);
        }
      );
    });
  });
  res.send("hi");
});
app.get("/", (req, res) => {
  res.redirect("/home/ctc");
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
