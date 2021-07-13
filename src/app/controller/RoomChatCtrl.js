const Rooms= require('../models/RoomChat')

const RoomCtrl={
    createRoom:async({listUser,name})=>{
        try {
            const newRoom= new Rooms({
                name:name,members:[...listUser]
            })
            await newRoom.save()
            return true
        } catch(e) {
            console.log(e)
        }
    }
    ,
    getDataRoom:async(name)=>{
        try {
       const room=await Rooms.findOne({name:name})
            if(room){
                return room
            }
            else{
                return false
            }
        } catch (error) {
            console.log(error)
        }
    },
    updataRoom:async(data)=>{
        try {
            const room=await Rooms.findOne({name:data.room})
            const list=room.content;
            list.push(data)
           const newRoom=await Rooms.findOneAndUpdate({name:data.room},{content:[...list]},{new:true});
           return newRoom
            
        } catch (error) {
            console.log(error)
        }
    },
    getRoomById:async(id)=>{
        try {
            const rooms=await Rooms.find({})
            const list=rooms.filter(item=>{
               let check= item.members.some(item=>item._id===id)
               return check===true
            })
           return list
            
        } catch (error) {
            console.log(error)
        }
    }
   
}

module.exports=RoomCtrl