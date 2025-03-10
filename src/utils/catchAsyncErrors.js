import ErrorHandler from "./ErrorHandler";

export const catchAsyncErrors = (fn) => {
  return (request, reply) => {
    fn(request, reply).catch((err) => {
      if (err instanceof ErrorHandler) {
        reply.status(err.statusCode).send({
          status: err.status,
          message: err.message,
        });
      } else {
        reply.status(500).send({
          status: "error",
          message: "Internal Server Error",
        });
      }
    });
  };
};
