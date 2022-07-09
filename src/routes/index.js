const UserRoute = require('./UserRoute')
const PostRoute = require('./PostRoute')
const StoryRoute = require('./StoryRoute')

const route =(app)=>{
    app.use('/home',(req,res)=>res.send('hello'))
    app.use('/api/user',UserRoute)
    app.use('/api/post',PostRoute)
    app.use('/api/story',StoryRoute)
}

module.exports=route