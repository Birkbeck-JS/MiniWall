const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()

const Post = require("../models/Post")
const User = require("../models/User")

const verifyToken = require("../verifyToken")

//Get users, delete later as this shouldn't be available
// router.get("/getusers", async(req,res) => {
//     try{
//         const getUsers = await User.find()
//         res.send(getUsers)
//     }catch(err){
//         //send reply as a JSON message
//         res.send({message:err})
//     }
// })

// router.get("/create", verifyToken, (req, res) => {
//     res.send("creation time")
// })

//Post Create Post
router.post("/create", verifyToken, async(req,res) => {
    const postData = new Post({
        user:seshwari._id,
        username:seshwari.username,
        title:req.body.title,
        text:req.body.text,
        likesNum:0,
    })
    //always try in case of error
    try{
        //have to wait for data, then save contents, then send it back
        const postToSave = await postData.save()
        res.send(postToSave)
    }catch(err){
        //send reply as a JSON message
        res.send({message:err})
    }
})

//Get all posts in order of likes, then date
router.get("/", verifyToken, async(req, res) => {
    try{
        const getPosts = await Post.find().sort({"likesNum": -1, "date": 0}) //.limit(5) should add limit in future, but fine for this particular model, goes before sort
        res.send(getPosts)
    }catch(err){
        res.send({message:err})
    }
})

//Patch Comment
router.patch("/comment/:postID", verifyToken, async(req, res) => {
    try{
        const comment = {
            commentBody:req.body.commentBody,
            commentUser:seshwari._id,
            commentUsername:seshwari.username
        }
        const updatePost = await Post.findById(req.params.postID)
        if (updatePost.user.valueOf() != seshwari._id.valueOf()){
            updatePost.comments.unshift(comment)
            updatePost.save()
            res.send(updatePost)
        }else{
            res.send({message:"can't comment on your own posts"})
        }

    }catch(err){
        res.send({message:err})
    }
})

//Patch Delete Comment
router.patch("/comment/delete/:postID/:commentID", verifyToken, async(req, res) => {
    try{
        const fullPost = await Post.findById({_id:req.params.postID})
        //check user deleting is user who owns comment or post owner
        const commentDelete = await Post.findOne({"_id": mongoose.Types.ObjectId(req.params.postID)}, {"_id": 0, "comments": {$elemMatch: {_id: mongoose.Types.ObjectId(req.params.commentID)}}})
        if(fullPost.user.toString() == seshwari._id.toString() || commentDelete.comments[0].commentUser.toString() == seshwari._id.toString()){
            fullPost.comments.pull(req.params.commentID)
            fullPost.save()
            res.send(fullPost)
        }
        }catch(err){
            res.send({message:err})
        }
})

//Patch Like Post
router.patch("/like/:postID", verifyToken, async(req, res) => {
    try{
        //can use find as any return value will mean that the post has already been liked
        const liked = await Post.findOne({"_id": mongoose.Types.ObjectId(req.params.postID), "likedBy.user": {$eq: seshwari._id}}, {"_id": 0, "likedBy.user": 1})
        //const test2 = await Post.findOne({"_id": mongoose.Types.ObjectId(req.params.postID), "likedBy.user": {$eq: mongoose.Types.ObjectId("6386b1128659ab8fcca7d621")}}, {"_id": 0, "likedBy.user": 1})
        //check if post has already been liked by user
        if(liked == null){
            //if post hasn't already been liked by user, check user isn't post owner
            const updateLikes = await Post.findById({"_id": req.params.postID}, {"user": 1, "likedBy": 1, "likesNum": 1})
            if(updateLikes.user.valueOf() != seshwari._id.valueOf()){
                updateLikes.likesNum += 1
                updateLikes.likedBy.unshift({user:seshwari._id, username:seshwari.username}) //add user to array of likes
                updateLikes.save()
                res.send({message:"liked"})
            }else{
                res.send("you can't like your own post")
            }
        }else{
            res.send("you've already liked this post")
        }                
    }catch(err){
        res.send({message:err})
    }
})

//Patch Unlike post
router.patch("/unlike/:postID", verifyToken, async(req, res) => {
    try{
        //check if post has already been liked by user
        const unliked = await Post.findOne({"_id": mongoose.Types.ObjectId(req.params.postID), "likedBy.user": {$eq: seshwari._id}}, {"likedBy.user": 1, "likesNum": 1})
        const user_check = (unliked.likedBy[0].user.valueOf() == seshwari._id.valueOf())
        if(user_check){
            unliked.likesNum -= 1
            unliked.save()
            pullit = await Post.updateOne({"_id": mongoose.Types.ObjectId(req.params.postID)}, {$pull: {likedBy: {user: seshwari._id}}})
            res.send({message:"unliked"})
        }else{
            res.send("you've never liked this post")
        }                
    }catch(err){
        res.send({message:err})
    }
})

//Delete Post
router.delete("/delete/:postID", verifyToken, async(req, res) => {
    try{
        const deletecheck = await Post.findById({_id:req.params.postID})
        //check user deleting is user who owns post
        if(deletecheck.user.toString() == seshwari._id.toString()){
            const deletetPostByID = await Post.deleteOne({_id:req.params.postID})
            res.send(deletetPostByID)
        }else{
            res.send("you can't delete this post")
        }
        }catch(err){
            res.send({message:err})
        }
})

module.exports = router