const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return next(new ApiError(400, result.error.issues.map((issue) => issue.message).join(", ")));
  }

  req.validated = result.data;
  next();
};

module.exports = validate;
