function errorHandler(error, _req, res, _next) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
}

module.exports = { errorHandler };
