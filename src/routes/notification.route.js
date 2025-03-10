import { isAuthenticatedUser } from "./../middlewares/isAuthenticatedUser.js";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "./../controllers/notification.controller.js";

export const notificationRoutes = async (fastify) => {
  fastify.get("/", { preHandler: [isAuthenticatedUser] }, getNotifications);

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
