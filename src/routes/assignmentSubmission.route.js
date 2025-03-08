import {
  deleteAssignmentSubmission,
  submitAssignment,
} from "../controllers/assignmentSubmission.controller.js";

export const assignmentSubmissionRoutes = (fastify) => {
  fastify.post(
    "/assignment-submission",
    { preHandler: [isAuthenticatedUser] },
    submitAssignment
  );
  fastify.delete(
    "/assignment-submission/:id",
    { preHandler: [isAuthenticatedUser] },
    deleteAssignmentSubmission
  );
};
