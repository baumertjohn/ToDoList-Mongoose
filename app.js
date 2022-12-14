const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Comment out to add mongodb backend.
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

app.get("/", function (req, res) {
  // const day = date.getDate();

  res.render("list", { listTitle: "Today", newListItems: items });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
