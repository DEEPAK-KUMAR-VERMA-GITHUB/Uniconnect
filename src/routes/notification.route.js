import { isAuthenticatedUser } from "./../middlewares/isAuthenticatedUser.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "./../controllers/notification.controller.js";

export const notificationRoutes = async (fastify) => {
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: {
        querystring: {
          type: "object",
          properties: {
            page: { type: "number", minimum: 1 },
            limit: { type: "number", minimum: 1, maximum: 50 },
          },
        },
      },
    },
    getNotifications
  );

  fastify.put(
    "/:id/read",
    {
      preHandler: [isAuthenticatedUser],
    },
    markNotificationRead
  );

  fastify.put(
    "/read-all",
    {
      preHandler: [isAuthenticatedUser],
    },
    markAllNotificationsRead
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [isAuthenticatedUser],
    },
    deleteNotification
  );
};
