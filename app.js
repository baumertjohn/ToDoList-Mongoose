const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Comment out to add mongodb backend.
// const items = ["Buy Food", "Cook Food", "Eat Food"];
const initialTasks = [
  { name: "Welcome to your todolist!" },
  { name: "Hit the + button to add a new item," },
  { name: "<-- Hit this to delete an item." },
];
const workItems = [];

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemsSchema);

const listSchema = { name: String, items: [itemsSchema] };
const List = mongoose.model("List", listSchema);

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
  const newItem = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({ name: newItem });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

// create dynamic route
app.get("/:listName", function (req, res) {
  let listName = req.params.listName;
  List.findOne({ name: listName }, function (err, list) {
    if (err) {
      console.log(err);
    } else {
      if (list) {
        // Show the existing list.
        res.render("list", { listTitle: list.name, newListItems: list.items });
      } else {
        // Create a new list and show.
        let list = new List({ name: listName, items: initialTasks });
        list.save();
        res.redirect("/" + listName);
      }
    }
  });
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

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
