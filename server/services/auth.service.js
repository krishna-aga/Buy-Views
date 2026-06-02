const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  walletBalance: user.walletBalance,
  pendingEarnings: user.pendingEarnings,
  approvedEarnings: user.approvedEarnings,
  totalWithdrawn: user.totalWithdrawn,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const registerUser = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  return {
    token: signToken({ id: user._id, role: user.role }),
    user: sanitizeUser(user),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    token: signToken({ id: user._id, role: user.role }),
    user: sanitizeUser(user),
  };
};

module.exports = {
  registerUser,
  loginUser,
  sanitizeUser,
};
