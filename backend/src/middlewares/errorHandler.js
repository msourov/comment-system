import ApiError from '../utils/ApiError';
const errorHandler = (err, req, res, next) => {
  let error = err;
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new ApiError(400, 'Validation Error', errors);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ApiError(400, `${field} already exists`);
  }

  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid ID format');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
