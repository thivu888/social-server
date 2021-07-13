const mongoose=require('mongoose')
require('dotenv').config()

    const connect=()=>{
        mongoose.connect(process.env.MONGO_URL,{
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true})
        .then(()=>console.log('connect database success!!'))
        .catch(()=>console.log('connect database fail!!!'))
    }

module.exports={connect}