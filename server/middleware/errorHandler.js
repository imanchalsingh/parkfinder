const errorHandler = (err, req, res, next) => {
  if (err && err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
