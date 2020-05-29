var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var ObjectId = require("mongodb").ObjectID;
const mongoose = require("mongoose");
mongoose.connect(
  "mongodb://localhost:27017/Todo",
  { useUnifiedTopology: true, useNewUrlParser: true },
  (err) => {
    if (!err) {
      console.log("mongo connected");
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);
var db = mongoose.connection;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.post("/addtask", function (req, res) {
  var f = req.query.f;
  var caption = req.body.caption;
  if (caption == "") {
    return res.redirect("/?f="+f);
  }
  var data = {
    caption: caption,
    isComplete: false,
  };
  db.collection("Tasks").insertOne(data, function (err) {
    if (err) {
      console.log("Task not added");
    } else {
      console.log("Task added");
      return res.redirect("/?f="+f);
    }
  });
});

app.get("/removetask", function (req, res) {
  var i = req.query.id;
  var f = req.query.f;
  db.collection("Tasks").deleteOne({
    _id: ObjectId(i),
  });
  res.redirect("/?f="+f);
});

app.get("/comptask", function (req, res) {
  var f = req.query.f;
  var i = req.query.id;
  let task = db
    .collection("Tasks")
    .findOne({ _id: ObjectId(i) })
    .then((task) => {
      db.collection("Tasks").updateOne(
        {
          _id: ObjectId(i),
        },
        {
          $set: { isComplete: !task.isComplete },
        }
      );
      res.redirect("/?f="+f);
    });
});
app.get("/", (req, res) => {
  var filter = req.query.f;
  if (filter == "active") {
    db.collection("Tasks")
      .find({ isComplete: false })
      .toArray(function (err, result) {
        if (err) throw err;
        res.render("index", {
          task: result,
          filterType: "active"
        });
      });
  }
  else if (filter == "comp") {
    db.collection("Tasks")
      .find({ isComplete: true })
      .toArray(function (err, result) {
        if (err) throw err;
        res.render("index", {
          task: result,
          filterType: "comp"
        });
      });
  }
  else {
         db.collection("Tasks")
           .find({})
           .toArray(function (err, result) {
             if (err) throw err;
             res.render("index", {
               task: result,
               filterType: "all"
             });
           });
       }
});
app.listen(3200, function () {
  console.log("server is running on port 3200");
});
