const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initial tasks to populate when new list is created.
const initialTasks = [
  { name: "Welcome to your todolist!" },
  { name: "Hit the + button to add a new item," },
  { name: "<-- Hit this to delete an item." },
];

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");

const itemsSchema = new mongoose.Schema({ name: String });
const Item = mongoose.model("Item", itemsSchema);

const listSchema = { name: String, items: [itemsSchema] };
const List = mongoose.model("List", listSchema);

// Display home page or custom list.
app.get("/", function (req, res) {
  // const day = date.getDate();
  // Find items in database and pass to home page.
  Item.find(function (err, items) {
    if (err) {
      console.log(err);
    } else {
      // Populate home list if it is empty.
      if (items.length === 0) {
        Item.insertMany(initialTasks, function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/");
          }
        });
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    }
  });
});

// Add items to Today list or custom list.
app.post("/", function (req, res) {
  const newItem = req.body.newItem;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.create({ name: newItem }, function (err) {});
    res.redirect("/");
  } else {
    List.findOneAndUpdate({ name: listName }, { $push: { items: { name: newItem } } }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }
});

// Create new list or display an existing custom list.
app.get("/:listName", function (req, res) {
  const listName = _.capitalize(req.params.listName);
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

// Delete items from Today list or custom list.
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
