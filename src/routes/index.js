const UserRoute = require('./UserRoute')
const PostRoute = require('./PostRoute')

const route =(app)=>{
    app.use('/home',(req,res)=>res.send('hello'))
    app.use('/api/user',UserRoute)
    app.use('/api/post',PostRoute)
}

module.exports=route