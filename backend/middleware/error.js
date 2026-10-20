import { httpError } from '../utils/httpError.js';

export const notFound = (req, res, next) => next(httpError(404, `Route nahi mila: ${req.originalUrl}`));

export const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'Ye pehle se exist karta hai';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'Image 3MB se chhoti honi chahiye';
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
