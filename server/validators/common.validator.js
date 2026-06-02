const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");

module.exports = {
  z,
  objectId,
};
