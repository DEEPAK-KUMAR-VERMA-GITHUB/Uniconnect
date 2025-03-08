import {
  createSubject,
  getSubjects,
  updateSubject,
} from "../controllers/subject.controller.js";
import {
  isAdmin,
  isAuthenticatedUser,
} from "./../middlewares/isAuthenticatedUser";

const subjectSchema = {
  type: "object",
  properties: {
    subjectName: { type: "string" },
    subjectCode: { type: "string" },
    subjectFaculty: { type: "string" },
    subjectCourse: { type: "string" },
  },
  required: ["subjectName", "subjectCode", "subjectFaculty", "subjectCourse"],
};

export const subjectRoutes = (fastify) => {
  fastify.post(
    "/create-subject",
    {
      schema: { body: subjectSchema },
      preHandler: [isAuthenticatedUser, isAdmin],
    },

    createSubject
  );
  fastify.get("all-subjects", getSubjects);
  fastify.put(
    "/update-subject/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    updateSubject
  );
  fastify.delete(
    "/delete-subject/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    deleteSubject
  );
};
