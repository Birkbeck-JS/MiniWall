const express = require("express")
const router = express.Router()
const bcryptjs = require("bcryptjs")
const jsonwebtoken = require("jsonwebtoken")
const session = require("express-session")
const mongoose = require('mongoose')

const User = require("../models/User")
const {registerValidation, loginValidation} = require("../validations/validations")

router.get("/register", (req, res) => {
    res.send("register page")
})

// Session Setup
router.use(session({
  
    // It holds the secret key for session
    secret: process.env.SESSION_SECRET,
  
    // Forces the session to be saved
    // back to the session store
    resave: true,
  
    // Forces a session that is "uninitialized"
    // to be saved to the store
    saveUninitialized: true
}))

//create session if user skips to login page
router.get("/login", function(req, res){
    res.send("login to continue")
})

//only need to create session if we decide to give user a token when they register, currently need to login after registering
router.get("/register", function(req, res){
    seshwari = req.session
    seshwari._id;
    seshwari.username
    seshwari.token;
    res.send("register your account")
})

router.post("/register", async(req,res) => {

    //validation 1 - check user input
    const {error, value} = registerValidation(req.body)
    //pick out error message to send back through indexing
    if (error){
        //console.log(value.email)
        //console.log(error["details"][0].context.invalids[0])
        return res.status(400).send({message:error["details"][0]["message"]})
    }

    //validation 2 - check if user already exists
    const userExists = await User.findOne({email:req.body.email})
    if (userExists){
        console.log(registerValidation(req.body))
        return res.status(400).send({message: "email already in use"})
    }

    //salt adds randomness on top of encryption
    //created hashed representation of password
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password,salt)

    //code to insert data
    const user = new User({
        username:req.body.username,
        email:req.body.email,
        password:hashedPassword
    })

    try{
        const savedUser = await user.save()
        //res.send(savedUser)
        res.redirect("/login")
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.post("/login", async(req,res) => {
    
    seshwari = req.session
    seshwari._id;
    seshwari.username
    seshwari.token;

    //validation 1 - check user input
    const {error} = loginValidation(req.body)
    if (error){
        return res.status(400).send({message:error["details"][0]["message"]})
    }

    //validation 2 - check user exists
    const user = await User.findOne({email:req.body.email})

    //create global user variables
    seshwari._id = user._id
    seshwari.username = user.username
    if (!user){
        return res.status(400).send({message: "No such user exists"})
    }

    //validation 3 - check user password
    const passwordValidation = await bcryptjs.compare(req.body.password, user.password)
    if(!passwordValidation){
        return res.status(400).send({message: "Password is wrong"})
    }
    
    //generate an auth-token
    const token = jsonwebtoken.sign({_id:user._id}, process.env.TOKEN_SECRET)
    
    //create global token that can be used in verifyToken to avoid having to type it everytime
    seshwari.token = token
    res.header("auth-token", token).send({"auth-token": token})
})

module.exports = router