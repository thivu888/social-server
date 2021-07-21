const Story=require('../models/Story')
const cloudinary = require('cloudinary')
const fs = require('fs')
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})
const StoryCtrl={
    createStory:async(req,res)=>{
        console.log(req.files,req.body)
        try {
        let url='';
        let public_id=''
        const file=req.files.file
        if(file.mimetype.includes('image')){
            await cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "story/img"}, async(err, result)=>{
                if(err) throw err;
                removeTmp(file.tempFilePath)
                url=result.secure_url;
                public_id=result.public_id
            })
        }
        if(file.mimetype.includes('video')){
            await  cloudinary.v2.uploader.upload(file.tempFilePath, 
                { resource_type: "video", 
                  folder:'story/video',
                  chunk_size: 6000000,
                  eager: [
                    { width: 300, height: 300, crop: "pad", audio_codec: "none" }, 
                    { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" } ],                                   
                  eager_async: true},
                function(error, result) {
                    if(error) throw error;
                    removeTmp(file.tempFilePath)
                    url=result.secure_url;
                    public_id=result.public_id
                });
        }
        let newStory
        if(req.body.content){
            newStory=new Story({url,public_id,user:req.body.id,content:req.body.content})
        }else{
            newStory=new Story({url,public_id,user:req.body.id})
        }
        await newStory.save();
        const storys=await Story.find({})
        res.json({success:true,story:storys})
        } catch (error) {
            return res.status(500).json({success:false,msg:'dang bai that bai'})
        }
    },
    getStorys:async(req,res)=>{
        try {
            const list= await Story.find({})
            res.json({success:true,storys:list})
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
module.exports=StoryCtrl