import mongoose from "mongoose";
const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: [true, "Subject name is required"],
    unique: true,
  },
  subjectCode: {
    type: String,
    required: [true, "Subject code is required"],
    unique: true,
  },
  subjectFaculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
  },
  subjectCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
});

export const Subject = mongoose.model("Subject", subjectSchema);
