import { Semester } from "../models/semester.model";

export const createSemester = async (request, reply) => {
  try {
    const { semesterName, semesterCode } = request.body;

    const isSemesterExists = await Semester.findOne({
      $or: [{ semesterName }, { semesterCode }],
    });

    if (isSemesterExists) {
      return reply.code(400).send({
        success: false,
        message: "Semester already exists",
      });
    }

    const semester = await Semester.create({
      semesterName,
      semesterCode,
    });

    return reply.code(201).send({
      success: true,
      message: "Semester created successfully",
      semester,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

export const getAllSemesters = async (request, reply) => {
  try {
    const semesters = await Semester.find();

    return reply.code(200).send({
      success: true,
      semesters,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

export const getSemesterById = async (request, reply) => {
  try {
    const semester = await Semester.findById(request.params.id);

    if (!semester) {
      return reply.code(404).send({
        success: false,
        message: "Semester not found",
      });
    }

    return reply.code(200).send({
      success: true,
      semester,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

export const updateSemesterById = async (request, reply) => {
  try {
    const semester = await Semester.findByIdAndUpdate(
      request.params.id,
      request.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!semester) {
      return reply.code(404).send({
        success: false,
        message: "Semester not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Semester updated successfully",
      semester,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

export const deleteSemesterById = async (request, reply) => {
  try {
    const semester = await Semester.findByIdAndDelete(request.params.id);

    if (!semester) {
      return reply.code(404).send({
        success: false,
        message: "Semester not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Semester deleted successfully",
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};


