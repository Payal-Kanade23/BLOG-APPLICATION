import mongoose, { Schema, Document } from "mongoose";

export interface IAudit extends Document {
  author?: mongoose.Types.ObjectId;

  action: string;

  resource: string;
  resourceId?: mongoose.Types.ObjectId;

  metadata?: Record<string, unknown>;

  ipAddress?: string;
  userAgent?: string;

  createdAt: Date;
  updatedAt: Date;
}

const auditSchema = new Schema<IAudit>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    resource: {
      type: String,
      required: true,
      index: true,
    },

    resourceId: {
      type: Schema.Types.ObjectId,
      index: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Useful for analytics and admin activity queries
auditSchema.index({ createdAt: -1 });
auditSchema.index({ userId: 1, createdAt: -1 });
auditSchema.index({ action: 1, createdAt: -1 });

const Audit =
  mongoose.models.Audit ||
  mongoose.model<IAudit>("Audit", auditSchema);

export default Audit;