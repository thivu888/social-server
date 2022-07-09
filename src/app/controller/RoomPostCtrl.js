const RoomPost=require('../models/RoomPost')
const RoomPostCtrl={
    getRooms:async()=>{
        try {
         const list= await RoomPost.find({})
            return list
        } catch (error) {
            console.log(error)
        }
    },
     getRoomByName:async(name)=>{
        try {
         const room= await RoomPost.findOne({name:name})
            return room
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports=RoomPostCtrl