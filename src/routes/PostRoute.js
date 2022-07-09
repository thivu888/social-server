  
const express = require('express')
const PostCtrl=require('../app/controller/PostCtrl')
const auth=require('../app/middleware/auth')
const cache=require('../cacheRouter');
const router = express.Router();

router.post('/',auth,PostCtrl.createPost)
router.post('/filecomment',auth,PostCtrl.filecomment)
router.get('/getpost',cache(30),PostCtrl.getPosts)
router.post('/delete',auth,PostCtrl.deletePost)
router.get('/getpostbyuserid/:id',cache(30),PostCtrl.getpostbyuserid)
router.get('/getpostbyid/:id',cache(30),PostCtrl.getpostbyid)


module.exports=router