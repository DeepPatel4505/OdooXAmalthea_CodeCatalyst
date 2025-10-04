export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
    code = "VALIDATION_ERROR";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
    code = "UNAUTHORIZED";
  } else if (err.code === "23505") {
    // PostgreSQL unique violation
    statusCode = 409;
    message = "Resource already exists";
    code = "DUPLICATE_RESOURCE";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key violation
    statusCode = 400;
    message = "Referenced resource does not exist";
    code = "FOREIGN_KEY_VIOLATION";
  } else if (err.code === "23502") {
    // PostgreSQL not null violation
    statusCode = 400;
    message = "Required field is missing";
    code = "NULL_VIOLATION";
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || "CUSTOM_ERROR";
  }

  res.status(statusCode).json({
    error: true,
    message,
    code,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: true,
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
};
