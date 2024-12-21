const { verifyToken } = require("../utils/jwt");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyJWT;
