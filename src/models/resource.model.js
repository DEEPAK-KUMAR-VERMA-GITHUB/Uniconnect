import mongoose from "mongoose";

export const resourceTypes = Object.freeze({
  NOTES: "notes",
  PYQ: "pyq",
  ASSIGNMENT: "assignment",
});

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["notes", "pyq", "assignment"],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // for pyqs
    year: {
      type: Number,
      required: true,
    },
    // for assignments
    dueDate: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    submissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssignmentSubmission",
      },
    ],
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Resource = mongoose.model("Resource", resourceSchema);
