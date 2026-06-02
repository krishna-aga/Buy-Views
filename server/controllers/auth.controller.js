const { registerUser, loginUser, sanitizeUser } = require("../services/auth.service");

const register = async (req, res) => {
  const result = await registerUser(req.validated.body);
  res.status(201).json({ success: true, ...result });
};

const login = async (req, res) => {
  const result = await loginUser(req.validated.body);
  res.status(200).json({ success: true, ...result });
};

const me = async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

module.exports = {
  register,
  login,
  me,
};
