const express = require('express')
const PostCtrl=require('../app/controller/PostCtrl')
const auth=require('../app/middleware/auth')
const router = express.Router();

router.post('/',auth,PostCtrl.createPost)
router.get('/getpost',PostCtrl.getPosts)
router.post('/delete',auth,PostCtrl.deletePost)
router.get('/getpostbyuserid/:id',PostCtrl.getpostbyuserid)


module.exports=router