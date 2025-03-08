import {
  createSemester,
  deleteSemesterById,
  getAllSemesters,
  getSemesterById,
  updateSemesterById,
} from "../controllers/semester.controller";
import {
  isAdmin,
  isAuthenticatedUser,
} from "../middlewares/isAuthenticatedUser";

const semesterSchema = {
  body: {
    type: "object",
    required: ["semesterName", "semesterCode"],
    properties: {
      semesterName: { type: "string" },
      semesterCode: { type: "string" },
    },
  },
};

export const semesterRoutes = async function (fastify) {
  fastify.post(
    "/create-semester",
    { schema: semesterSchema, preHandler: [isAuthenticatedUser, isAdmin] },
    createSemester
  );
  fastify.get(
    "/all-semesters",
    { preHandler: [isAuthenticatedUser] },
    getAllSemesters
  );
  fastify.get("/:id", { preHandler: [isAuthenticatedUser] }, getSemesterById);
  fastify.put(
    "/update-semester/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    updateSemesterById
  );
  fastify.delete(
    "/delete-semester/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    deleteSemesterById
  );
};
