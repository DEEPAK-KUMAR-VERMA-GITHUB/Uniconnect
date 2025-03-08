import jwt from "jsonwebtoken";
import { Faculty, Student, UserRoles } from "../models/user.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import path from "path";
import { sendJWTToken } from "../utils/sendJWTToken.js";
import { request } from "http";
import { sendEmail } from "../utils/sendMail.js";
import crypto from "crypto";
import { forgotPasswordEmailTemplate } from "../emails/resetPasswordTemplate.js";

// function to register a student
export const registerStudent = async (request, reply) => {
  console.log(request.body);
  try {
    const {
      name,
      email,
      password,
      mobileNumber,
      rollNumber,
      course,
      session,
      semester,
    } = request.body;

    // want to verify if the same roll no or email is already registered or not
    const isUserExists = await Student.findOne({
      $or: [{ email }, { rollNumber }],
    });
    if (isUserExists) {
      return reply.code(400).send({
        success: false,
        message: "User already exists",
      });
    }

    const student = await Student.create({
      name,
      email,
      password,
      mobileNumber,
      rollNumber,
      course,
      session,
      semester,
      role: UserRoles.STUDENT,
    });

    return reply.code(201).send({
      success: true,
      message: "Student registered successfully. Pending for admin approval...",
      student,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to register a faculty
export const registerFaculty = async (request, reply) => {
  try {
    const {
      name,
      email,
      password,
      mobileNumber,
      facultyId,
      department,
      designation,
      course,
    } = request.body;

    const isUserExists = await Faculty.findOne({
      $or: [{ email }, { facultyId }],
    });
    if (isUserExists) {
      return reply.code(400).send({
        success: false,
        message: "User already exists",
      });
    }

    const faculty = await Faculty.create({
      name,
      email,
      password,
      mobileNumber,
      facultyId,
      department,
      course,
      designation,
      role: UserRoles.FACULTY,
    });

    return reply.code(201).send({
      success: true,
      message: "Faculty registered successfully. Pending for admin approval...",
      faculty,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// login user
export const loginUser = async (request, reply) => {
  try {
    const { email, password } = request.body;

    const user =
      (await Student.findOne({ email }).select("+password")) ||
      (await Faculty.findOne({ email }).select("+password"));

    if (!user) {
      return reply.code(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return reply.code(401).send({
        success: false,
        message: "User is not active",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return reply.code(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    sendJWTToken(user, 200, reply);
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function for refresh tokens
export const refreshTokens = async (request, reply) => {
  try {
    const { refreshToken } = request.cookies;
    if (!refreshToken) {
      return reply.code(401).send({
        success: false,
        message: "Refresh Token Missing",
      });
    }

    const decodedData = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    let user = null;

    if (decodedData.role === UserRoles.STUDENT) {
      user = await Student.findById(decodedData.id);
    } else if (decodedData.role === UserRoles.FACULTY) {
      user = await Faculty.findById(decodedData.id);
    }

    if (!user) {
      return reply.code(403).send({
        success: false,
        message: "User not found",
      });
    }

    const tokens = user.getSignedJwtToken();
    return reply.code(200).send({
      success: true,
      message: "Tokens refreshed successfully",
      ...tokens,
    });
  } catch (error) {
    return reply.code(403).send({
      success: false,
      message: "Invalid Refresh Token",
    });
  }
};

// function to fetch profile details
export const fetchProfileDetails = async (request, reply) => {
  // check if user is logged in
  const { accessToken } = request.cookies;
  if (!accessToken) {
    return reply.code(401).send({
      success: false,
      message: "Login first to access this route",
    });
  }

  const decodedData = jwt.verify(accessToken, process.env.JWT_SECRET);
  if (!decodedData) {
    return reply.code(401).send({
      success: false,
      message: "Invalid access token",
    });
  }

  const { id, role } = decodedData;

  let user = null;

  if (role === UserRoles.STUDENT) {
    user = await Student.findById(id);
  } else if (role === UserRoles.FACULTY) {
    user = await Faculty.findById(id);
  } else {
    return reply.code(400).send({
      success: false,
      message: "Invalid user role",
    });
  }

  if (!user) {
    return reply.code(404).send({
      success: false,
      message: "User not found",
    });
  }

  return reply.code(200).send({
    success: true,
    message: "User details fetched successfully",
    user,
  });
};

// function for fetch STUDENT by id
export const fetchStudent = async (request, reply) => {
  try {
    const { id } = request.params;
    const student = await Student.findById(id);
    if (!student) {
      return reply.code(404).send({
        success: false,
        message: "Student not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Student fetched successfully",
      student,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};
// function for fetch faculty by id
export const fetchFaculty = async (request, reply) => {
  try {
    const { id } = request.params;
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return reply.code(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Faculty fetched successfully",
      faculty,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to update student profile
export const updateStudentProfile = async (request, reply) => {
  try {
    const { name, email, mobileNumber, rollNumber, course, session, semester } =
      request.body;

    const student = await Student.findById(request.user.id);
    if (!student) {
      return reply.code(404).send({
        success: false,
        message: "Student not found",
      });
    }

    student.name = name;
    student.email = email;
    student.mobileNumber = mobileNumber;
    student.rollNumber = rollNumber;
    student.course = course;
    student.session = session;
    student.semester = semester;

    await student.save();

    return reply.code(200).send({
      success: true,
      message: "Student profile updated successfully",
      student,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};
// function to update faculty profile
export const updateFacultyProfile = async (request, reply) => {
  try {
    const { name, email, mobileNumber, facultyId, department, designation } =
      request.body;

    const faculty = await Faculty.findById(request.user.id);
    if (!faculty) {
      return reply.code(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    faculty.name = name;
    faculty.email = email;
    faculty.mobileNumber = mobileNumber;
    faculty.facultyId = facultyId;
    faculty.department = department;
    faculty.designation = designation;

    await faculty.save();

    return reply.code(200).send({
      success: true,
      message: "Faculty profile updated successfully",
      faculty,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to toggle user active status
export const toggleUserActiveStatus = async (request, reply) => {
  try {
    const { id } = request.params;
    const user = (await Student.findById(id)) || (await Faculty.findById(id));
    if (!user) {
      return reply.code(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return reply.code(200).send({
      success: true,
      message: "User active status updated successfully",
      user,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to fetch all students
export const fetchAllStudents = async (request, reply) => {
  try {
    // use query params to filter students
    const { course, session, semester, department } = request.query;

    let students = [];
    students = await Student.find({
      ...(course && { course }),
      ...(session && { session }),
      ...(semester && { semester }),
      ...(department && { department }),
    });

    return reply.code(200).send({
      success: true,
      message: "Students fetched successfully",
      students,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to fetch all faculties
export const fetchAllFaculties = async (request, reply) => {
  try {
    // use query params to filter faculties
    const { department } = request.query;

    let faculties = [];

    faculties = await Faculty.find({
      ...(department && { department }),
    });

    return reply.code(200).send({
      success: true,
      message: "Faculties fetched successfully",
      faculties,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to delete student
export const deleteStudent = async (request, reply) => {
  try {
    const { id } = request.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return reply.code(404).send({
        success: false,
        message: "Student not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Student deleted successfully",
      student,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to delete faculty
export const deleteFaculty = async (request, reply) => {
  try {
    const { id } = request.params;
    const faculty = await Faculty.findByIdAndDelete(id);
    if (!faculty) {
      return reply.code(404).send({
        success: false,
        message: "Faculty not found",
      });
    }

    return reply.code(200).send({
      success: true,
      message: "Faculty deleted successfully",
      faculty,
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};

// function to forgot password
export const forgotPassword = async (request, reply) => {
  const { email, role } = request.body;

  if (!email || !role) {
    return reply.code(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  let user = null;

  if (role === UserRoles.STUDENT) {
    user = await Student.findOne({ email });
  } else {
    user = await Faculty.findOne({ email });
  }

  if (!user) {
    return reply.code(404).send({
      success: false,
      message: "User not found",
    });
  }

  // send reset password token link to user email for reseting password
  let resetToken = await user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${request.protocol}://${request.hostname}/api/users/reset-password/${resetToken}`;

  const message = forgotPasswordEmailTemplate(user.name, resetUrl);

  await sendEmail(user, "Uniconnect Password Reset", message);

  return reply.code(200).send({
    success: true,
    message: "Email sent successfully",
  });
};

// function to reset the password using resettoken
export const resetPassword = async (request, reply) => {
  const { resetToken } = request.params;
  const { password, role } = request.body;

  if (!password || !role) {
    return reply.code(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  // Hash the reset token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  let user = null;

  if (role === UserRoles.STUDENT) {
    user = await Student.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  } else {
    user = await Faculty.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  }

  if (!user) {
    return reply.code(400).send({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  // Set the new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return reply.code(200).send({
    success: true,
    message: "Password reset successful",
  });
};

// function to update password
export const updatePassword = async (request, reply) => {
  const { id, role } = request.user;
  const { currentPassword, newPassword, confirmNewPassword } = request.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    return reply.code(400).send({
      success: false,
      message: "All fields are required",
    });
  }

  if (newPassword !== confirmNewPassword)
    return reply.code(400).send({
      success: false,
      message: "Password and Confirm Password doesn't match",
    });

  let user = null;

  if (role === UserRoles.STUDENT) {
    user = await Student.findById(id).select("+password");
  } else if (role === UserRoles.FACULTY || role === UserRoles.ADMIN) {
    user = await Faculty.findById(id).select("+password");
  } else {
    return reply.code(400).send({
      success: false,
      message: "Invalid user role",
    });
  }

  if (!user) {
    return reply.code(404).send({
      success: false,
      message: "User not found",
    });
  }

  const isPasswordMatched = await user.comparePassword(currentPassword);

  if (!isPasswordMatched) {
    return reply.code(400).send({
      success: false,
      message: "Current password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save();

  return reply.code(200).send({
    success: true,
    message: "Password updated successfully",
  });
};

// function to logout user
export const logoutUser = async (request, reply) => {
  try {
    const { id, role } = request.user;

    let user = null;

    if (role === UserRoles.STUDENT) {
      user = await Student.findById(id);
    } else if (role === UserRoles.FACULITY || UserRoles.ADMIN) {
      user = await Faculty.findById(id);
    } else {
      return new ErrorHandler("Invalid user role", 400);
    }

    if (!user) {
      return reply.code(404).send({
        success: false,
        message: "User not found",
      });
    }

    user.refreshToken = null;
    await user.save();

    reply.cookie("accessToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    reply.cookie("refreshToken", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    request.user = null;

    return reply.code(200).send({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    throw new ErrorHandler(error.message, 500);
  }
};
