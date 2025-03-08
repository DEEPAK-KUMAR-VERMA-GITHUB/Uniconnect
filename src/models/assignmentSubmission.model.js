import mongoose, { Schema } from "mongoose";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: "Resource",
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    fileUrl: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    modified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);
