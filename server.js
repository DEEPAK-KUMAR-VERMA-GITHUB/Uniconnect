import fastifyCookie from "@fastify/cookie";
import multipart from "@fastify/multipart";
import fastifyWebsocket from "@fastify/websocket";
import "dotenv/config";
import Fastify from "fastify";
import { assignmentSubmissionRoutes } from "./src/routes/assignmentSubmission.route.js";
import { courseRoutes } from "./src/routes/course.route.js";
import { notificationRoutes } from "./src/routes/notification.route.js";
import { resourceRoutes } from "./src/routes/resource.route.js";
import { subjectRoutes } from "./src/routes/subject.route.js";
import { userRoutes } from "./src/routes/user.route.js";
import { connectDB } from "./src/utils/databaseConnect.js";
import ErrorHandler from "./src/utils/ErrorHandler.js";
import { setupWebSocketHandlers } from "./src/websocket/handlers.js";

const startServer = async () => {
  try {
    await connectDB();

    const app = Fastify({ logger: true, trustProxy: true });

    // Register plugins
    await app.register(fastifyWebsocket);
    await app.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1,
      },
    });
    await app.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
    });

    // global middlewares
    // app.addHook("onRequest", rateLimiter);

    // Setup WebSocket handlers
    setupWebSocketHandlers(app);

    // Register routes
    app.register(userRoutes, { prefix: "/api/users" });
    app.register(courseRoutes, { prefix: "/api/courses" });
    app.register(resourceRoutes, { prefix: "/api/resources" });
    app.register(notificationRoutes, { prefix: "/api/notifications" });
    app.register(subjectRoutes, { prefix: "/api/subjects" });
    app.register(assignmentSubmissionRoutes, {
      prefix: "/api/assignment-submissions",
    });

    app.setErrorHandler(ErrorHandler);

    await app.listen({
      port: process.env.PORT || 3000,
      host: process.env.HOST || "0.0.0.0",
    });
    console.log(`Uniconnect-Server listening on ${app.server.address().port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
