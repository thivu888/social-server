require('dotenv').config()
const express = require('express')
const http=require('http')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const path = require('path')
const db=require('./src/config/db')
const route=require('./src/routes')
const {setLikes,setComment,updateCommentPost,getPostNameRoomPost}=require('./src/app/controller/PostCtrl')
const {getRooms,} =require('./src/app/controller/RoomPostCtrl')
const {getfullUser,getlistmessRealtime,updatelistmess}=require('./src/app/controller/UserCtrl')
const {getDataRoom,createRoom,updataRoom,getRoomById}=require('./src/app/controller/RoomChatCtrl')
db.connect();
const app = express()
const server=http.createServer(app)
const io=require('socket.io')(server,{cors:{
    origin:"*"
}});
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({
    useTempFiles: true
}))

// Routes
route(app)



// Connect to mongodb


if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

io.on('connection',async (socket)=>{
     socket.on('joinpages',  id=>{
       socket.join(id)
        console.log('joined')
    })


    socket.on('getlistuser',(id)=>{
        getfullUser(id).then(res=>{
            io.sockets.emit('ListUser',res)
        })

    })

    socket.on('getlistMess',id=>{
        getlistmessRealtime(id).then(list=>{
            socket.emit('sever-send-list-mess',list)})
    })
    
    socket.on('joinRomPost',data=>{

           getPostNameRoomPost(data.name).then(post=>{
                socket.join(data.name.toString())
               socket.emit('dataRoomCurrent',post)
           })


    })

   
    socket.on('sendComment',data=>{


        setComment(data).then(res=>{
            console.log(typeof data.room)

            io.to(data.room).emit('server-send-comment',res)
        })
       
    }) 

  

    socket.on('sendComment-rep',data=>{
     
        updateCommentPost(data).then(res=>{
            socket.join(data.room)
            io.to(data.room).emit('server-send-comment',res)
        })

    })

    socket.on('likePost',data=>{
        setLikes(data.postId,data.userId).then(res=>{
            socket.emit('getlistliked',res)
        })
      
    })

    socket.on('send-notify-seen-server',data=>{
        updatelistmess(data).then(res=>{
            socket.emit('send-notify-seen-client',res)
        })
    })

    socket.on('client-send-mess',data=>{
        updataRoom(data).then(res=>{
            io.to(data.room).emit('sever-send-mess',data)
            return data;
        }).then(data=>{
            console.log(123)
            getlistmessRealtime(data.toUser).then((list=>{
               socket.broadcast.to(data.toUser).emit('sever-send-notify-mess',list)
            })) 
            return data;
        }).then(data=>{
            getlistmessRealtime(data.userSend).then((list=>{
               socket.emit('sever-send-list-mess',list)
            }))
        })
    })

    socket.on('getdatamess',data=>{
      
        getDataRoom(data.name).then((res)=>{
            socket.join(data.name)
            if(res){
                socket.emit('server-send-data-mess',res)
            }
            else{
                createRoom({name:data.name,listUser:data.listUser})
                .then((res)=>{
                    if(res)
                    {
                        console.log('vẫy tay chào nhau nào!!!')
                    }
                })
            }
        })
    })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () =>{
    console.log('Server is running on port', PORT)
})