const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/home", (req, res) => {
  res.render("home");
});
app.get("/", (req, res) => {
  res.redirect("/home");
});
app.listen(port, () => console.log("app hosted at", port));
