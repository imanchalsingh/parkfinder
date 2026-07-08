const errorHandler = (err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};

export default errorHandler;
