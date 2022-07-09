 
const Post = require('../models/Post')
const RoomPost = require('../models/RoomPost')
const cloudinary = require('cloudinary')
const fs = require('fs')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const PostCtrl={
    createPost:async(req,res)=>{
            try {
                
           
            let img='';
            let img_public_id=''
            let video='';
            let video_public_id=''
            if(req.files){
                if(req.files.img){
                  await  cloudinary.v2.uploader.upload(req.files.img.tempFilePath, {folder: "post/img"},(error, result) =>{
                        if(error) throw error;
                        removeTmp(req.files.img.tempFilePath)
                        img=result.secure_url
                        img_public_id=result.public_id
                    });
                }
                if(req.files.video){
                    await  cloudinary.v2.uploader.upload(req.files.video.tempFilePath, 
                    { resource_type: "video", 
                      folder:'post/video',
                      chunk_size: 6000000,
                      eager: [
                        { width: 300, height: 300, crop: "pad", audio_codec: "none" }, 
                        { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" } ],                                   
                      eager_async: true},
                    function(error, result) {
                        if(error) throw error;
                        console.log(result)
                        removeTmp(req.files.video.tempFilePath)

                        video=result.secure_url
                        video_public_id=result.public_id
                    });
                }
            }
            const postId=Math.floor(((Math.random())*1000000)*((Math.random())*1000000))
             const newPost=new Post({userId:req.userId,content:req.body.content,img:img,video:video,video_public_id,img_public_id,postId})
               await newPost.save()
            const newRoomPost=new RoomPost({name:postId.toString()})
            await newRoomPost.save()
            res.json({success:true,msg:'dang bai thanh cong',newpost:newPost})
        } catch (error) {
            return res.status(500).json({success:false,msg:'dang bai that bai'})
        }
    },
    getPosts:async(req,res)=>{
            try {
                const posts=await Post.find({}).sort({createdAt:-1});
                if(res)
                res.json({success:true,posts})
                else{
                    return posts
                }
            } catch (err) {
                return res.status(500).json({success:false,msg: err.message})
            }
    },
    deletePost:async(req,res)=>{
        try {
        const {img_public_id,video_public_id,id} = req.body;
        if(img_public_id){
           await cloudinary.v2.uploader.destroy(img_public_id, async(err, result) =>{
                if(err) throw err;  
            })
        }
        if(video_public_id){
            await cloudinary.v2.uploader.destroy(video_public_id,{resource_type:'video'}, async(err, result) =>{
                if(err) throw err;  
            console.log(result)

            })

        }
            await Post.findByIdAndDelete(id)
            await RoomPost.findOneAndDelete({name:id.toString()})
            res.json({success:true,msg:'deleted'})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getpostbyuserid:async(req,res)=>{
        try {
            const list=await Post.find({userId:req.params.id})
            if(list){
                res.json({success:true,list:list})
            }else{
                res.status(403).json({success:false})

            }
        } catch (error) {
            console.log(error)
        }
    },
    getpostbyid:async(req,res)=>{
        try {
            const post=await Post.findById(req.params.id)
            res.json({success:true,post:post})
        } catch (error) {
            console.log(error)
        }
    }
    ,
    filecomment:async(req,res)=>{
        try {
            const file=req.files.file;
            if(file.mimetype.includes('image')){
                cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "post/comment/img"}, async(err, result)=>{
                    if(err) throw err;
        
                    removeTmp(file.tempFilePath)
        
                    res.json({public_id: result.public_id, url: result.secure_url,type:'image'})
                })
            }
            if(file.mimetype.includes('video')){
                await  cloudinary.v2.uploader.upload(file.tempFilePath, 
                    { resource_type: "video", 
                      folder:'post/comment/video',
                      chunk_size: 6000000,
                      eager: [
                        { width: 300, height: 300, crop: "pad", audio_codec: "none" }, 
                        { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" } ],                                   
                      eager_async: true},
                    function(error, result) {
                        if(error) throw error;
                        removeTmp(file.tempFilePath)
                        res.json({public_id: result.public_id, url: result.secure_url,type:'video'})
                    });
            }
        } catch (error) {
            console.log(error)
        }
    }
    ,
    updateCommentPost:async(data)=>{
        try {
            const post= await Post.findOne({postId:data.room})
            const comments=post.comments;
            let comment,index;
            comments.forEach((item,i)=>{
                if(item.comment_Id==data.comment_Id){
                    comment=item;
                    index=i;
                }
            })
            comment.repcomment.push(data)
            comments.splice(index,1,comment)

            const newpost=  await Post.findOneAndUpdate({postId:data.room},{comments:comments},{new:true})
            const roomPost=  await RoomPost.findOne({name:data.room})
            const newMembers=roomPost.members;
            if(!newMembers.includes(data.userId)){
             newMembers.push(data.userId)
            }
            const newRoomPost=  await RoomPost.findOneAndUpdate({name:data.room},{members:newMembers},{new:true})
            return {newpost,newRoomPost}
            
        } catch (error) {
            console.log(error)
        }
    }
    ,
    setLikes:async (idPost,idlike,type)=>{
        try {
            const post= await Post.findById(idPost)
            const list=post.likes;
            let newpost;
            if(!list.some(item=>item.idlike==idlike)){
                list.push({idlike,type})
                newpost= await Post.findByIdAndUpdate(idPost,{likes:[...list]},{new:true});
            }else{
                if(type==''){
                const newlist=list.filter(item=>item.idlike!=idlike)
                newpost=  await Post.findByIdAndUpdate(idPost,{likes:[...newlist]},{new:true});
                }
                else{

                    let index;
                    list.forEach((item,i)=>{
                        if(item.idlike==idlike){
                            index=i
                        }
                    })
                    list.splice(index,1,{idlike,type})
                    newpost= await Post.findByIdAndUpdate(idPost,{likes:[...list]},{new:true});
                }
            }
            return {newpost}
        } catch (err) {
            return console.log(err)
        }
    },
    setComment:async (data)=>{
        try {
            const post= await Post.findOne({postId:data.room})
            const newcomments=post.comments;
            newcomments.push(data)
            const newpost=  await Post.findOneAndUpdate({postId:data.room},{comments:newcomments},{new:true})
            const newPosts= await Post.find({})
            const roomPost=  await RoomPost.findOne({name:data.room})
            const newMembers=roomPost.members;
            if(!newMembers.includes(data.userId)){
             newMembers.push(data.userId)
            }
            const newRoomPost=  await RoomPost.findOneAndUpdate({name:data.room},{members:newMembers},{new:true})
            return {newpost,newRoomPost}
            
        } catch (error) {
            console.log(error)
        }
    },
    getPostNameRoomPost:async(name)=>{
        try{
        const post = await Post.findOne({postId:name})
        return post
    }catch(er){
        console.log(er)
    }
    }
    
}

 

const removeTmp = (path) =>{
        fs.unlink(path, err=>{
            if(err) throw err;
        })
    }
module.exports=PostCtrl;
