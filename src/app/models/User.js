const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      min: 3,
      max: 20,
      unique: true,
    },
    user_id:{
      type:Number,
      default:Math.floor(((Math.random())*1000000)*((Math.random())*1000000))
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    profilePicture: {
      type: String,
      default: "https://phanquangvu.tk/fileImage/user.png",
    },
    coverPicture: {
      type: String,
      default: "https://th.bing.com/th/id/R.4f7c1deb33d39351b6d2ce58cb0f0e54?rik=5QV1fKSAf6Btqg&riu=http%3a%2f%2ffc06.deviantart.net%2ffs70%2fi%2f2011%2f268%2fd%2fc%2fhyakuju_sentai_gaoranger_by_blakehunter-d4aw563.jpg&ehk=JsEugq8n0X7hrnhzYUm6CLZjujkrsrHP6PBoyddEQQI%3d&risl=&pid=ImgRaw",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3],
    },
    isOnline:{
      type:Boolean,
      default:false
    },
    notify:{
      type:Array,
      default:[]
    },
    RequestAddfriend:{
      type:Array,
      default:[]
    },
    RequestAddfriendSent:{
      type:Array,
      default:[]
    },
    friends:{
      type:Array,
      default:[]
    }
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);