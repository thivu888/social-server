const mongoose = require("mongoose");

const RoomPostSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      default:[]
    },
    name:{
        type:String,
        unique: true
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomPost", RoomPostSchema);
