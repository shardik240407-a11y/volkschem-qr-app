const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials.");
  }

  res.json({
    token: generateToken(admin._id),
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  });
};

const getMe = async (req, res) => {
  // req.admin is set by the protect middleware
  res.json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
};

module.exports = {
  login,
  getMe,
};
