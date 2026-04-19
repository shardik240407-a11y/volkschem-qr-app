const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. Missing token.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      res.status(401);
      throw new Error("Not authorized. Admin account not found.");
    }

    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    res.status(401);
    throw new Error("Not authorized. Token verification failed.");
  }
};

module.exports = {
  protect,
};
