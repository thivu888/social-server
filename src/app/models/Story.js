const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default:''
    },
    public_id:{
        type:String,
        default:''
    }
    ,
    user:{
        type:'string',
        require:true
    },
    url:{
        type:String,
        default:''
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StorySchema", StorySchema);
