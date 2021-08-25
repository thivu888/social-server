const express = require('express')
const userCtrl=require('../app/controller/UserCtrl')
const auth=require('../app/middleware/auth')
const cache=require('../cacheRouter');
const router = express.Router();

router.post('/register',userCtrl.register)
router.post('/login',userCtrl.login)
router.get('/getuserbyid/:id',cache(30),userCtrl.getUserById)
router.get('/getuserbyuserid/:id',cache(30),userCtrl.getuserbyuserid)
router.get('/getlistmess/:id',auth,userCtrl.getlistmess)
router.put('/updateprofile',auth,userCtrl.updateprofile)
router.put('/update',userCtrl.update)
router.get('/',auth,cache(30),userCtrl.getUser)

module.exports=router