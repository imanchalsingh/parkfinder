import AppError from "../utils/AppError.js";

const sendError = (err, req, res) => {
  const response = {
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Something went wrong",
    }
  };

  if (err.errors) {
    response.error.details = err.errors;
  }

  res.status(err.statusCode || 500).json(response);
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code || "INTERNAL_SERVER_ERROR";
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    error = new AppError(message, 404, "CAST_ERROR");
  }

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400, "DUPLICATE_KEY_ERROR");
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, "VALIDATION_ERROR");
  }

  // Handle Zod Validation Error (from validate.js)
  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    const message = "Invalid input provided";
    error = new AppError(message, 400, "VALIDATION_ERROR");
    error.errors = issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again!';
    error = new AppError(message, 401, "INVALID_TOKEN");
  }

  // Handle JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new AppError(message, 401, "TOKEN_EXPIRED");
  }
  
  // Custom AppErrors
  if (err.isOperational) {
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.code = err.code;
  }

  if (process.env.NODE_ENV !== "test") {
    console.error("ERROR 💥", err);
  }

  sendError(error, req, res);
};
