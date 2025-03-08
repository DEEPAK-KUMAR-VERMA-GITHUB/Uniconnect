// imports
import {
  deleteFaculty,
  deleteStudent,
  fetchAllFaculties,
  fetchAllStudents,
  fetchFaculty,
  fetchProfileDetails,
  fetchStudent,
  forgotPassword,
  loginUser,
  logoutUser,
  refreshTokens,
  registerFaculty,
  registerStudent,
  resetPassword,
  toggleUserActiveStatus,
  updateFacultyProfile,
  updatePassword,
  updateStudentProfile,
} from "../controllers/user.controller.js";
import {
  isAdmin,
  isAuthenticatedUser,
} from "../middlewares/isAuthenticatedUser.js";

// Fastify schema for student registration
const studentSchema = {
  body: {
    type: "object",
    required: [
      "name",
      "email",
      "password",
      "mobileNumber",
      "rollNumber",
      "course",
      "session",
      "semester",
    ],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      mobileNumber: { type: "number" },
      rollNumber: { type: "string" },
      course: { type: "string" },
      session: { type: "string" },
      semester: { type: "number", minimum: 1 },
    },
  },
};

// faculty schema
const facultySchema = {
  body: {
    type: "object",
    required: [
      "name",
      "email",
      "password",
      "mobileNumber",
      "facultyId",
      "department",
      "designation",
      "course",
    ],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      mobileNumber: { type: "number" },
      facultyId: { type: "string" },
      department: { type: "string" },
      designation: { type: "string" },
      course: { type: "string" },
    },
  },
};

// Login schema
const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
};

// Export route handlers
export const userRoutes = async (fastify) => {
  fastify.post("/register-student", { schema: studentSchema }, registerStudent);
  fastify.post("/register-faculty", { schema: facultySchema }, registerFaculty);
  fastify.post("/login", { schema: loginSchema }, loginUser);
  fastify.get(
    "/refresh-tokens",
    { preHandler: [isAuthenticatedUser] },
    refreshTokens
  );
  fastify.get(
    "/fetch-profile-details",
    { preHandler: [isAuthenticatedUser] },
    fetchProfileDetails
  );
  fastify.get(
    "/fetch-student/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    fetchStudent
  );
  fastify.get(
    "/fetch-faculty/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    fetchFaculty
  );
  fastify.put(
    "/update-student-profile",
    { preHandler: [isAuthenticatedUser] },
    updateStudentProfile
  );
  fastify.put(
    "/update-faculty-profile",
    { preHandler: [isAuthenticatedUser] },
    updateFacultyProfile
  );
  fastify.put(
    "/toggle-user-active-status/:id",
    { preHandler: [isAuthenticatedUser] },
    toggleUserActiveStatus
  );
  fastify.get(
    "/fetch-all-students",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    fetchAllStudents
  );
  fastify.get(
    "/fetch-all-faculties",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    fetchAllFaculties
  );
  fastify.delete(
    "/delete-student/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    deleteStudent
  );
  fastify.delete(
    "/delete-faculty/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    deleteFaculty
  );
  fastify.post("/forgot-password", forgotPassword);
  fastify.put("/reset-password/:resetToken", resetPassword);
  fastify.put(
    "/update-password",
    { preHandler: [isAuthenticatedUser] },
    updatePassword
  );

  fastify.get("/logout", { preHandler: [isAuthenticatedUser] }, logoutUser);
};
