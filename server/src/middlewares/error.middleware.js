export const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) return next(err);

  let statusCode = 500;

  if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (err.code === "23505") {
    statusCode = 409;
  } else if (err.code === "23514") {
    statusCode = 400;
  } else if (err.code === "23503") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    data: null,
  });
};
