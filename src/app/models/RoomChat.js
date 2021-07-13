const mongoose = require("mongoose");

const RoomChatSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      default:[]
    },
    name:{
        type:String,
        unique: true
    },
    content:{
        type:Array,
        default:[]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomChat", RoomChatSchema);
