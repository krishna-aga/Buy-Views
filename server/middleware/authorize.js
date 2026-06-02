const ApiError = require("../utils/ApiError");

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, "You are not allowed to access this resource"));
  }

  next();
};

module.exports = authorize;
