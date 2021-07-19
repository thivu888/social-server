
require('dotenv').config()
const express = require('express')
const http=require('http')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const path = require('path')
const db=require('./src/config/db')
const route=require('./src/routes')
const {setLikes,setComment,updateCommentPost,getPostNameRoomPost,getPosts}=require('./src/app/controller/PostCtrl')
const {getRooms,getRoomByName} =require('./src/app/controller/RoomPostCtrl')
const {getfullUser,getlistmessRealtime,updatelistmess,setOffline,updateNotify,updatelistNotify,updateRequestFriend,updateFriend, removeFriend}=require('./src/app/controller/UserCtrl')
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
       socket.name=id
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
            io.to(data.room).emit('server-send-comment',res)
        })
        getRoomByName(data.room).then(res=>{
            if(res.members.length>0){
               const list= res.members.filter(item=>item!=data.userId)
               list.forEach(item=>{
                   updateNotify({id:item,userSendId:data.userId,idPost:data.room,createAt:data.createAt,userPostId:data.UserCreator}).then(res=>{
                    socket.to(item).emit('server-send-notify-comment',res)
                   })
                   
                })
                console.log(data.UserCreator)
            }
            
        })
        updateNotify({id:data.UserCreator,userSendId:data.userId,idPost:data.room,createAt:data.createAt,userPostId:data.UserCreator}).then(res=>{
            socket.to(data.UserCreator).emit('server-send-notify-comment',res)
        })
    }) 

  

    socket.on('sendComment-rep',data=>{
        console.log(data)
        updateCommentPost(data).then(res=>{
            socket.join(data.room)
            io.to(data.room).emit('server-send-comment',res)
        })

    })

    socket.on('likePost',data=>{
        
        setLikes(data.postId,data.userId,data.type).then(res=>{
            console.log(data)
            socket.emit('getlistliked',res)
        })
      
    })

    socket.on('send-notify-seen-server',data=>{
        updatelistmess(data).then(res=>{
            console.log('update seen')
            socket.emit('send-notify-seen-client',res)
        })
    })

    socket.on('client-send-seen-notify',item=>{
        updatelistNotify(item).then(res=>{
            socket.emit('server-send-seen-notify',res)
        })
    })

    socket.on('client-send-mess',data=>{
        updataRoom(data).then(res=>{
            io.to(data.room).emit('sever-send-mess',data)
            return data;
        }).then(data=>{
            getlistmessRealtime(data.toUser).then((list=>{
               socket.broadcast.to(data.toUser).emit('sever-send-notify-mess',list)
            })) 
            return data;
        }).then(data=>{
            getlistmessRealtime(data.userSend).then((list=>{
                console.log('vao')
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

    socket.on('client-send-request-addFriend',data=>{
        updateRequestFriend(data).then(res=>{
            io.to(data.toUserId).emit('server-send-notify-add-friend',res.newToUser.RequestAddfriend)
            io.to(data.userSendId).emit('server-send-request-add-friend',res.newUserSend.RequestAddfriendSent)
        })
    })

    socket.on('accept-friend',data=>{
        if(data.type==false){
            updateRequestFriend(data).then(res=>{
                io.to(data.toUserId).emit('server-send-notify-add-friend',res.newToUser.RequestAddfriend)
                io.to(data.userSendId).emit('server-send-request-add-friend',res.newUserSend.RequestAddfriendSent)
            })
        }else{
            updateFriend(data).then(res=>{
                io.to(data.toUserId).emit('server-send-notify-add-friend',res.newToUser.RequestAddfriend)
                io.to(data.userSendId).emit('server-send-request-add-friend',res.newUserSend.RequestAddfriendSent)
                io.to(data.toUserId).emit('server-send-list-friend',res.newToUser.friends)
                io.to(data.userSendId).emit('server-send-list-friend-user-sent',res.newUserSend.friends)
                console.log('den day')
            })
        }
    })

    socket.on('remove-friend',data=>{
        removeFriend(data).then(res=>{
                io.to(data.userRemove).emit('server-send-list-friend',res.newUserRemove.friends)
                io.to(data.toUser).emit('server-send-list-friend-user-sent',res.newToUser.friends)
        })
    })

    socket.on('create-post',()=>{
        io.sockets.emit('create-new-post')
        // getPosts().then(res=>{
        //     io.sockets.emit('new-list-post',res)
        // })
    })

    socket.on('disconnect',()=>{
        if(socket.name){
            setOffline(socket.name).then(res=>{
                io.sockets.emit('ListUser',res)
            })
        }
    })
        
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () =>{
    console.log('Server is running on port', PORT)
})
