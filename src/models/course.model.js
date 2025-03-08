// course model for course collection
import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema(
  {
    courseName: {
      type: String,
      required: [true, "Course Name is required"],
      validate: {
        validator: function (value) {
          const nameRegex = /^[a-zA-Z\s]+$/;
          return nameRegex.test(value);
        },
        message: "Name must contain only letters and spaces",
      },
    },
    courseCode: {
      type: String,
      required: [true, "Course Code is required"],
      unique: true,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Coordinator ID is required"],
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
