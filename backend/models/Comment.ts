import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // null is a top-level comment; otherwise this is a reply to another
    // comment on the same blog.
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1_000,
    },
    // Soft deletion keeps the reply tree intact.
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

commentSchema.index({ blog: 1, parentComment: 1, createdAt: -1 });
commentSchema.index({ blog: 1, createdAt: -1, _id: -1 });

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
