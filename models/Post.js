const { required } = require("joi");
const mongoose = require("mongoose")

Schema = mongoose.Schema

// Create Schema
const PostSchema = Schema({
    user:{
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    username:{
        type: String,
        ref: "users",
        required: true
    },
    title:{
      type: String,
      required: true
    },
    date:{
      type: Date,
      default: Date.now
    },
    text:{
      type: String,
      required: true
    },
    //comments as an array
    comments: [{
      commentBody: {
        type: String,
        required: true
      },
      commentDate:{
        type: Date,
        default: Date.now
      },
      commentUser:{
        type: Schema.Types.ObjectId,
        ref:"users",
        required: true
      },
      commentUsername:{
        type: String,
        ref:"users",
        required: true
      }
    }],
    likesNum: {
        type: Number,
        default: 0,
        required: true
    },
    //liked by an array to add what users liked the post
    likedBy: [{
        user:{
        type: Schema.Types.ObjectId,
        ref:"users",
        required: true
        },
        username:{
        type: String,
        ref:"users",
        required: true
        }
    }]
  });
  
  // Create collection and add schema
  module.exports = mongoose.model("posts", PostSchema);