const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const authMiddleware = async (req, res, next) => {
  // Check for token in headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Authentication invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request object
    req.user = {
      userId: payload.userId,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ error: "Authentication invalid" });
  }
};

module.exports = authMiddleware;
