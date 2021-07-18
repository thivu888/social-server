const express = require('express')
const StoryCtrl=require('../app/controller/StoryCtrl')
const auth=require('../app/middleware/auth')
const router = express.Router();

router.post('/create',auth,StoryCtrl.createStory)
router.get('/',StoryCtrl.getStorys)

module.exports=router