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
const initialTasks = [{ name: "Buy Food" }, { name: "Cook Food" }, { name: "Eat Food" }];
const workItems = [];

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

app.get("/", function (req, res) {
  // const day = date.getDate();

  // Find items in database and pass to home page.
  Item.find(function (err, items) {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(initialTasks, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Added items to database.");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    }
  });
});

app.post("/", function (req, res) {
  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    // items.push(item);
    Item.create({ name: item }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("New item added to list.");
      }
    });
    res.redirect("/");
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Task Deleted");
    }
  });
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
