import { Course } from "../models/course.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// Create a new course
export const createCourse = async (request, reply) => {
  try {
    const { courseName, courseCode, coordinator } = request.body;

    const isCourseExists = await Course.findOne({ courseCode });
    if (isCourseExists) {
      return reply.code(400).send({
        success: false,
        message: "Course already exists",
      });
    }

    const course = await Course.create({
      courseName,
      courseCode,
      coordinator,
    });

    return reply.code(201).send({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// Get all courses
export const getAllCourses = async (request, reply) => {
  try {
    const courses = await Course.find();

    return reply.code(200).send({
      success: true,
      courses,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// Get course by ID
export const getCourseById = async (request, reply) => {
  try {
    const course = await Course.findById(request.params.id);

    if (!course) {
      return reply.code(404).send({
        success: false,
        message: "Course not found",
      });
    }

    return reply.code(200).send({
      success: true,
      course,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// Update course by ID
export const updateCourseById = async (request, reply) => {
  try {
    const course = await Course.findById(request.params.id);

    if (!course) {
      return reply.code(404).send({
        success: false,
        message: "Course not found",
      });
    }

    const { courseName, courseCode, coordinator } = request.body;

    course.courseName = courseName;
    course.courseCode = courseCode;
    course.coordinator = coordinator;

    await course.save();

    return reply.code(200).send({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// Delete course by ID
export const deleteCourseById = async (request, reply) => {
  try {
    const course = await Course.findByIdAndDelete(request.params.id);

    if (!course) {
      return reply.code(404).send({
        success: false,
        message: "Course not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};
