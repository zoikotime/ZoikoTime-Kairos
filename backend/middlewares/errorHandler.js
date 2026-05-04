function errorHandler(error, _req, res, _next) {
  console.error(error);

  // Sequelize errors
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: error.errors.map((e) => e.message).join(", "),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists.",
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Invalid reference: related record does not exist.",
    });
  }

  if (error.name === "SequelizeDatabaseError") {
    return res.status(400).json({
      success: false,
      message: "Database error: " + error.message,
    });
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
}

module.exports = { errorHandler };