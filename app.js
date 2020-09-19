//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

const homeStartingContent = "Have a crazy experiance? \n Have a love for something? \n Here is the place to write about it. Post your story for everyone to read and maybe they will share a story or two also. \n \n Click the COMPOSE button above and let you mind go crazy!!";
const aboutContent = "Here at the Daily Journey we love to hear your stories. Life experiances are what made us what we are today.";
const contactContent = "Support Team \n 555-123-4567 \n support@thiswillnotwork.not";

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", { useNewUrlParser: true, useUnifiedTopology: true });

const postSchema = {
  title: { type: String, required: [true, "Title is required"] },
  content: { type: String, minlength: [10, "Post must be atleast 10 characters"] }
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  Post.find({}, function (err, postsFound) {
    if (!err) {
      res.render("home", {
        startContent: homeStartingContent,
        postsContent: postsFound
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent: contactContent
  });
});

app.get("/compose", function (req, res) {
  res.render("compose",{
    placeHolderMessage: "Enter Title", 
    placeHolderPost: "Enter post with atleast 10 characters",
    savedPost: ""
  });
});

app.get("/post/:postId", function (req, res) {
  const postId = req.params.postId;
  Post.findOne({ _id: postId}, function(err, foundPost){
    if(!err){
      res.render("post", {
        postTitle: foundPost.title,
        postBlog: foundPost.content
      });     
    }
  });
});

app.post("/compose", function (req, res) {
  const writenPost = req.body.blog;

  const post = new Post({ 
    title: req.body.title, 
    content: writenPost
  });

  post.save(function (err) {
    if (err) {
      if(err.message === "Post validation failed: title: Title is required" || 
         err.message === "Post validation failed: content: Post must be atleast 10 characters"){
          res.render("compose", {
            placeHolderMessage: "Title is required",
            placeHolderPost: "Post must be atleast 10 characters long",
            savedPost: writenPost
          });
      }
      else{
        console.log(err);
      }
    }
    else{
      res.redirect("/");
    }
  });
});

app.listen(port, function () {
  console.log(`Server started on port: ${port}`);
});

