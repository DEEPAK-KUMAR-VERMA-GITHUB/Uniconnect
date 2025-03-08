import {
  createResource,
  deleteResource,
  getResource,
  getResources,
  updateResource,
} from "../controllers/resource.controller.js";
import {
  isAdmin,
  isAuthenticatedUser,
} from "./../middlewares/isAuthenticatedUser.js";

const resourceSchema = {
  body: {
    type: "object",
    properties: {
      title: { type: "string" },
      type: { type: "string" },
      fileUrl: { type: "string" },
      subject: { type: "string" },
      semester: { type: "string" },
      course: { type: "string" },
      year: { type: "number" },
      dueDate: { type: "string" },
    },
  },
};

export const resourceRoutes = (fastify) => {
  fastify.post(
    "/resources",
    { schema: resourceSchema, preHandler: [isAuthenticatedUser, isAdmin] },
    createResource
  );
  fastify.get("/resource/:id", getResource);
  fastify.put(
    "/resource/:id",
    { schema: resourceSchema, preHandler: [isAuthenticatedUser, isAdmin] },
    updateResource
  );
  fastify.delete(
    "/resource/:id",
    { preHandler: [isAuthenticatedUser, isAdmin] },
    deleteResource
  );
  fastify.get("/all-resources", getResources);
};
