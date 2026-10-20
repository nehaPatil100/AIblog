export const httpError = (status, message) => {
  const e = new Error(message);
  e.status = status;
  return e;
};

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
