import { Faculty, UserRoles } from "../models/user.model.js";
import jwt from "jsonwebtoken";

// function to check is user is authenticated or not
export const isAuthenticatedUser = async (request, reply) => {
  try {
    const { accessToken } = request.cookies;
    if (!accessToken) {
      return reply.code(401).send({
        message: "Please login to access this resource",
      });
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    if (!decoded) {
      return reply.code(401).send({
        message: "Please login to access this resource",
      });
    }

    request.user = decoded;
  } catch (err) {
    console.error(err);
    return reply.code(401).send({
      message: "Please login to access this resource",
    });
  }
};

// function to check if user is admin or not
export const authorizeRoles = (...roles) => {
  return (request, reply) => {
    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({
        message: `Role (${request.user.role}) is not allowed to access this resource`,
      });
    }
    done();
  };
};

export const isUserActive = async (request, reply) => {
  try {
    const user = await User.findById(request.user.id);
    if (!user) {
      return reply.code(404).send({
        message: "User not found",
      });
    }

    if (!user.active) {
      return reply.code(403).send({
        message: "User is not active",
      });
    }

    done();
  } catch (err) {
    console.error(err);
    return reply.code(404).send({
      message: "User not found",
    });
  }
};

// function to check if user is admin or not
export const isAdmin = async (request, reply) => {
  if (request.user.role !== UserRoles.ADMIN) {
    return reply.code(403).send({
      success: false,
      message: "User is not authorized to access this resource",
    });
  }
};
