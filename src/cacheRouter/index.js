const NodeCache = require( "node-cache" );
const cache = new NodeCache();


module.exports=duration=>(req,res,next)=>{
    if(req.method!=='GET'){
        console.log("cannot cache non-method GET");
        next();
    }

    const key=req.originalUrl;
    const cacheRespon=cache.get(key);
    if(cacheRespon){
        console.log("cache ok");
        res.send(cacheRespon);
    }else{
        console.log("cache no ok");
        res.originalSend=res.send;
        res.send=body=>{
            res.originalSend(body);
            cache.set(key,body,duration);
           
        }
        next();
    }
}