export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const sendResponse = (
  res,
  statusCode,
  { data = null, message = null, meta = null } = {},
) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    meta,
  });
};
