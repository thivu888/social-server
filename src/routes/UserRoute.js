const express = require('express')
const userCtrl=require('../app/controller/UserCtrl')
const auth=require('../app/middleware/auth')
const router = express.Router();

router.post('/register',userCtrl.register)
router.post('/login',userCtrl.login)
router.get('/getuserbyid/:id',userCtrl.getUserById)
router.get('/getuserbyuserid/:id',userCtrl.getuserbyuserid)
router.get('/getlistmess/:id',auth,userCtrl.getlistmess)
router.put('/updateprofile',auth,userCtrl.updateprofile)
router.put('/update',userCtrl.update)
router.get('/',auth,userCtrl.getUser)

module.exports=router