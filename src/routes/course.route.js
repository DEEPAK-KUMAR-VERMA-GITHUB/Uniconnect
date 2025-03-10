// course routes for course collection
import {
  createCourse,
  deleteCourseById,
  getAllCourses,
  getCourseById,
  updateCourseById
} from "../controllers/course.controller.js";
import {
  isAdmin,
  isAuthenticatedUser,
} from "./../middlewares/isAuthenticatedUser.js";
// fastify schema for course registration
const courseSchema = {
  body: {
    type: "object",
    required: ["courseName", "courseCode"],
    properties: {
      courseName: { type: "string" },
      courseCode: { type: "string" },
    },
  },
};

// course routes
export const courseRoutes = async function (fastify) {
  fastify.post(
    "/create-course",
    { schema: courseSchema, preHandler: [isAuthenticatedUser, isAdmin] },
    createCourse
  );
  fastify.get(
    "/all-courses",
    { preHandler: [isAuthenticatedUser] },
    getAllCourses
  );
  fastify.get("/:id", { preHandler: [isAuthenticatedUser] }, getCourseById);
  fastify.put(
    "/update-course/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    updateCourseById
  );
  fastify.delete(
    "/delete-course/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    deleteCourseById
  );
};
