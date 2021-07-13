const Users = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const RoomChat=require('../models/RoomChat')
const UserCtrl = {
    register: async (req, res) =>{
        try {
            const {name, email, password} = req.body;

            const user = await Users.findOne({email})
            if(user) return res.status(400).json({success:false,msg: "The email already exists."})

            if(password.length < 6) 
                return res.status(400).json({success:false,msg: "Password is at least 6 characters long."})

            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                username:name, email, password: passwordHash
            })

            // Save mongodb
            await newUser.save()

            // Then create jsonwebtoken to authentication
            const accesstoken = createAccessToken({id: newUser._id})
            res.json({success:true,accesstoken})

        } catch (err) {
            return res.status(500).json({success:false,msg: err.message})
        }
    },
    login: async (req, res) =>{
        try {
            const {email, password} = req.body;

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({success:false,msg: "User does not exist."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({success:false,msg: "Incorrect password."})

            // If login success , create access token and refresh token
            const accesstoken = createAccessToken({id: user._id})
            res.json({success:true,accesstoken})
        } catch (err) {
            return res.status(500).json({success:false,msg: err.message})
        }
    },
    logout: async (req, res) =>{
        try {
            return res.json({success:true,msg: "Logged out"})
        } catch (err) {
            return res.status(500).json({success:false,msg: err.message})
        }
    },
    refreshToken: (req, res) =>{
        try {
            const rf_token = req.cookies.refreshtoken;
            if(!rf_token) return res.status(400).json({success:false,msg: "Please Login or Register"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
                if(err) return res.status(400).json({success:false,msg: "Please Login or Register"})

                const accesstoken = createAccessToken({id: user.id})

                res.json({success:true,accesstoken})
            })

        } catch (err) {
            return res.status(500).json({success:false,msg: err.message})
        }
        
    },
    getUser: async (req, res) =>{
        try {
            const user = await Users.findById(req.userId).select('-password')
            if(!user) return res.status(400).json({success:false,msg: "User does not exist."})

            res.json({success:true,user})
        } catch (err) {
            return res.status(500).json({success:false,msg: err.message})
        }
    },
    getUserById:async(req,res)=>{
    try{
        const user=await Users.findById(req.params.id).select('-password')
        if(!user) return res.status(400).json({success:false,msg: "User does not exist."})

        res.json({success:true,user})
    } catch (err) {
        return res.status(500).json({success:false,msg: err.message})
    }
    },
    update: async (req, res)=>{
        try {
            const user = await User.findByIdAndUpdate(req.userId, {
                $set: req.body,
              });
              if(user)
                res.status(200).json({success:true,msg:"Account has been updated"});
              else{
                 return res.status(403).json({success:false,msg:"You can update only your account!"});
              }
        } catch (error) {
            return res.status(403).json({success:false,msg:"You can update only your account!"});
            
        }
    },
    getfullUser: async(id)=>{
        try {
            const list= await Users.find({})
            
            return list
        } catch (error) {
            console.log(error)
        }
        
    },
    getlistmess:async(req,res)=>{
        try {
            const list =await RoomChat.find({});
            const listRoom=list.filter(item=>{
              return  item.members.some(e=>e.user_id==req.params.id)
            })
            res.json({success:true,list:listRoom})
        } catch (error) {
            console.log(error)
        }
    },
    getlistmessRealtime:async(id)=>{
        try {
            const list =await RoomChat.find({});
            const listRoom=list.filter(item=>{
              return  item.members.some(e=>e._id==id)
            })
           return listRoom
        } catch (error) {
            console.log(error)
        }
    },
    updatelistmess:async(data)=>{
        try {
            let listRoom=[];
            const room =await RoomChat.findOne({name:data.room});

            if(room&&room.content&&room.content.length>0&&room.content[room.content.length-1].userSend!=data.id)
            {
             room.content.forEach(item=>{
                 item.seen=true
                 listRoom.push(item)
                })
                const newRoom= await RoomChat.findOneAndUpdate({name:data.room},{content:listRoom},{new:true})
                const list =await RoomChat.find({});
                const listroom=list.filter(item=>{
                return  item.members.some(e=>e._id==data.id)

                })
            return listroom
            }
          
        return listRoom
        } catch (error) {
            console.log(error)
        }
    },
   
   
    
 }


const createAccessToken = (user) =>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}
const createRefreshToken = (user) =>{
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = UserCtrl