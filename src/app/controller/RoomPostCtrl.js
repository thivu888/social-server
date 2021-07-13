const RoomPost=require('../models/RoomPost')
const RoomPostCtrl={
    getRooms:async()=>{
        try {
         const list= await RoomPost.find({})
            return list
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports=RoomPostCtrl