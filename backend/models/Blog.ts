import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    author:{
    
            ref:"User",
            type:mongoose.Schema.Types.ObjectId,
            required:true,

    },
    title:{
        type:String,
        required:true,
        
    },
    subtitle:{
        type:String,
        required:true,
        
    },
    content:{
        type:String,
        required:true,

    },
    Visibility:{
        type:String,
        enum:["PUBLIC" ,"PRIVATE"],
        default:"PUBLIC"
    },
    totalLikes:{
        type:Number,
        default: 0,
    },
    totalComments:{
        type:Number,
        default: 0,
    },

    

},
    
    {
    timestamps: true
})

const Blog =  mongoose.model("Blog",blogSchema);
export default Blog;