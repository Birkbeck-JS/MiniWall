const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
require("dotenv/config")

const session = require("express-session")

//create express app
const app = express()

// Session Setup
app.use(session({
  
    // It holds the secret key for session
    secret: process.env.SESSION_SECRET,
  
    // Forces the session to be saved back to the session store
    resave: true,
  
    // Forces a session that is "uninitialized" to be saved to the store
    saveUninitialized: false
}))

//create session with some variables that can be used in all routers
app.get("/", function(req, res){
    seshwari = req.session
    seshwari._id;
    seshwari.username
    seshwari.token;
    res.send("login or register to continue")
})

//body parser middleware
app.use(bodyParser.json())

//load routes
const postsRoute = require("./routes/posts")
const authRoute = require("./routes/auth")

//use routes
app.use("/posts", postsRoute)
app.use("/", authRoute)

//connect to mongoDB
mongoose.connect(process.env.DB_CONN, () => {
    console.log("DB is connected")
})

//only to be used during testing to delete database
app.post("/init", async(req,res) => {
    //const dropdb = await mongoose.connection.db.dropDatabase("MiniWall")
    try{
        //drop collections to initialise blank database for testing
        const dropposts = await mongoose.connection.db.dropCollection("posts")
        const dropusers = await mongoose.connection.db.dropCollection("users")
    }catch(err){
        //send reply as a JSON message
        res.send({message:err})
    }   
})

//connect to server
app.listen(3000, () => {
    console.log("server is running...")
})