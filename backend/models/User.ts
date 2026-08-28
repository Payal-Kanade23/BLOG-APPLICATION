import mongoose from "mongoose";
import { ROLES } from "../utils/permission";
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,

    },
    role:{
        type:String,
        enum:[ROLES.ADMIN , ROLES.USER],
        default:"USER"
    },
    profileImage: {
    type: String,
    default: "",
  },
    isVerified:{
        type:Boolean,
        default:true,
    },
    isBlocked:{
        type:Boolean,
        default:false,

    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"

        }
    ],
    followings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"

        }
    ],
    isPrivate:{
    type:Boolean,
    default:false
},
followRequest:[{
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    status:{
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending" 
    }
}],

  permission:{
    type:[String],
    default:[]
  }



})

const User =mongoose.model("User", userSchema);
export default User;
