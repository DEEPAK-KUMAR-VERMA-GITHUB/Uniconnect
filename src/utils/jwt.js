import jwt from 'jsonwebtoken';
import ErrorHandler from './ErrorHandler.js';

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new ErrorHandler(401, 'Invalid or expired token');
  }
};
