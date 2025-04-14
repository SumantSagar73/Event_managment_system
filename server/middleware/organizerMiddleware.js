const { StatusCodes } = require("http-status-codes");

const organizerMiddleware = (req, res, next) => {
  if (req.user.role !== "organizer" && req.user.role !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({
        error:
          "Access denied. Only organizers and admins can perform this action",
      });
  }
  next();
};

module.exports = organizerMiddleware;
