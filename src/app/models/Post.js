const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    postId:{type:Number,
      unique:true
          },
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      max: 500,
      default:''
    },
    img: {
      type: String,
      default:''
    },
    video: {
      type: String,
      default:''
    },
    likes: {
      type: Array,
      default: [],
    },
    comments:{
      type:Array,
      default:[]
    },
    video_public_id:{
      type:String,
      default:''
    },
    img_public_id:{
      type:String,
      default:''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
