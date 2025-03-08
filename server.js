import "dotenv/config";
import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import { connectDB } from "./src/utils/databaseConnect.js";
import { errorMiddleware } from "./src/middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "./src/middlewares/catchAsyncErrors.js";
import multipart from "@fastify/multipart";
// import { noteRoutes } from "./src/routes/note.route.js";
import { userRoutes } from "./src/routes/user.route.js";
import { courseRoutes } from "./src/routes/course.route.js";
import fastifyCookie from "@fastify/cookie";
import { resourceRoutes } from "./src/routes/resource.route.js";

// import { pyqRoutes } from "./src/routes/pyq.route.js";
// import { assignmentRoutes } from "./src/routes";
// import { notificationRoutes } from "./src/routes/notification.route.js";
// import { setupWebSocketHandlers } from "./src/websocket/handlers.js";

const startServer = catchAsyncErrors(async () => {
  await connectDB();
  const app = Fastify({ logger: true });

  // Register plugins
  await app.register(fastifyWebsocket);
  await app.register(multipart, {
    limits: {
      fileSize: 10000000, // 10MB limit
      files: 1,
    },
  });

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });

  // Setup WebSocket handlers
  // setupWebSocketHandlers(app);

  // Register routes
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(courseRoutes, { prefix: "/api/courses" });
  app.register(resourceRoutes, { prefix: "/api/resources" });

  app.setErrorHandler(errorMiddleware);

  try {
    app.listen({
      port: process.env.PORT || 3000,
      host: process.env.HOST || "0.0.0.0",
    });
    console.log(`Uniconnect-Server listening on ${app.server.address().port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

startServer();
