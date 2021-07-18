const Users = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const RoomChat=require('../models/RoomChat')
const fs = require('fs')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})
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
            const user_id=Math.round(Math.sqrt(Math.floor(((Math.random())*1000000)*((Math.random())*1000000)))*Math.sqrt(Math.floor(((Math.random())*1000000)*((Math.random())*1000000))))
            const newUser = new Users({
                username:name, email, password: passwordHash,user_id
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
            const user = await Users.findByIdAndUpdate(req.userId, {
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
    updateprofile:async(req,res)=>{
        
        let avt='';
        let cov='';
        let avt_public_id=''
        let cov_public_id=''
        try {
        console.log(req.files)
        if(req.files){
            if(req.files.avatar){
              await  cloudinary.v2.uploader.upload(req.files.avatar.tempFilePath, {folder: `user/${req.body.id}/avatar`},(error, result) =>{
                    if(error) throw error;
                    removeTmp(req.files.avatar.tempFilePath)
                    avt=result.secure_url
                    avt_public_id=result.public_id
                });
            }
            if(req.files.cover){
                await  cloudinary.v2.uploader.upload(req.files.cover.tempFilePath, {folder: `user/${req.body.id}/cover`},(error, result) =>{
                      if(error) throw error;
                      removeTmp(req.files.cover.tempFilePath)
                      cov=result.secure_url
                      cov_public_id=result.public_id
                  });
              }
        }
        if(avt&&cov){
            await Users.findByIdAndUpdate(req.body.id,{profilePicture:avt,coverPicture:cov})
            res.json({success:true})
        }else if(avt){
            await Users.findByIdAndUpdate(req.body.id,{profilePicture:avt})
            res.json({success:true})
        }else if(cov){
            await Users.findByIdAndUpdate(req.body.id,{coverPicture:cov})
            res.json({success:true})
        }
        else{
            res.status(403).json({success:false,msg:'update fail'})
        }
        } catch (error) {
            console.log(error)
        }
    },
    getfullUser: async(id)=>{
        try {
            await Users.findByIdAndUpdate(id,{isOnline:true})
            const list= await Users.find({})
            return list
        } catch (error) {
            console.log(error)
        }
    },
    setOffline:async(id)=>{
        try {
            await Users.findByIdAndUpdate(id,{isOnline:false})
            const list= await Users.find({})
            return list
        } catch (error) {
            console.log(error)
        }
    }
    ,
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
    updatelistNotify:async(item)=>{
        const user=await Users.findById(item.userCurrent)
        const listNotify=user.notify
        const newListNotify=[...listNotify]
        let index;
        listNotify.forEach((it,ind)=>{
            if(it.createAt==item.createAt){
                index=ind
            }
        })
        newListNotify[index].isRead=true
        await Users.findByIdAndUpdate(item.userCurrent,{notify:newListNotify})
        return newListNotify
    }
    ,

    updateNotify:async(data)=>{
        try {
            const user=await Users.findById(data.id)
            const listnotify=user.notify
            if(!listnotify.some(item=>item.type=='COMMENT'&&item.userId==data.userSendId&&item.idpost==data.idPost)){
            listnotify.unshift({type:"COMMENT",userId:data.userSendId,idpost:data.idPost,createAt:data.createAt,userPostId:data.userPostId,isRead:false})
             await Users.findByIdAndUpdate(data.id,{notify:listnotify},{new:true})
            }
             return listnotify
        } catch (error) {
            console.log(error)
            
        }
    },
    updateRequestFriend:async(data)=>{
        try {
            console.log(data)
            const userSend=await Users.findById(data.userSendId)
            const toUser= await Users.findById(data.toUserId)
            let listRequestAddfriendSent=userSend.RequestAddfriendSent
            let listRequestAddfriend=toUser.RequestAddfriend
            if(listRequestAddfriendSent.some(item=>item.id==data.toUserId)&&listRequestAddfriend.some(item=>item.id==data.userSendId)){
                listRequestAddfriendSent=listRequestAddfriendSent.filter(item=>item.id!=data.toUserId)
                listRequestAddfriend=listRequestAddfriend.filter(item=>item.id!=data.userSendId)
            }else{
                listRequestAddfriendSent.unshift({id:data.toUserId,createAt:data.createAt})
                listRequestAddfriend.unshift({id:data.userSendId,createAt:data.createAt})
            }
            const newUserSend =await Users.findByIdAndUpdate(data.userSendId,{RequestAddfriendSent:[...listRequestAddfriendSent]},{new:true})
            const newToUser =await Users.findByIdAndUpdate(data.toUserId,{RequestAddfriend:[...listRequestAddfriend]},{new:true})
            return {newUserSend,newToUser}
        } catch (error) {
            console.log(error)
            
        }
    },
    updateFriend:async(data)=>{
        try {
            const userSend=await Users.findById(data.userSendId)
            const toUser= await Users.findById(data.toUserId)
            let listRequestAddfriendSent=userSend.RequestAddfriendSent
            let listRequestAddfriend=toUser.RequestAddfriend
            let listfriend1=userSend.friends
            let listfriend2=toUser.friends
            listfriend1.push({id:data.toUserId,createAt:data.createAt})
            listfriend2.push({id:data.userSendId,createAt:data.createAt})
            listRequestAddfriendSent=listRequestAddfriendSent.filter(item=>item.id!=data.toUserId)
            listRequestAddfriend=listRequestAddfriend.filter(item=>item.id!=data.userSendId)
            const newUserSend =await Users.findByIdAndUpdate(data.userSendId,{RequestAddfriendSent:[...listRequestAddfriendSent],friends:[...listfriend1]},{new:true})
            const newToUser =await Users.findByIdAndUpdate(data.toUserId,{RequestAddfriend:[...listRequestAddfriend],friends:[...listfriend2]},{new:true})
            return {newUserSend,newToUser}
        } catch (error) {
            console.log(error)
        }
    },
    removeFriend:async(data)=>{
        try {
            const userRemove=await Users.findById(data.userRemove)
            const toUser= await Users.findById(data.toUser)
            let listfriend1=userRemove.friends
            let listfriend2=toUser.friends
            listfriend1=listfriend1.filter(item=>item.id!=data.toUser)
            listfriend2=listfriend2.filter(item=>item.id!=data.userRemove)
            const newUserRemove =await Users.findByIdAndUpdate(data.userRemove,{friends:[...listfriend1]},{new:true})
            const newToUser =await Users.findByIdAndUpdate(data.toUser,{friends:[...listfriend2]},{new:true})
            return {newUserRemove,newToUser}
        } catch (error) {
            console.log(error)
        }
    }
   
   
    
 }


 const removeTmp = (path) =>{
    fs.unlink(path, err=>{
        if(err) throw err;
    })
}
const createAccessToken = (user) =>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}
const createRefreshToken = (user) =>{
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}

module.exports = UserCtrl