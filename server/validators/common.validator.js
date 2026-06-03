const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");
const googleDriveUrl = z
  .string()
  .trim()
  .url("Enter a valid Google Drive URL")
  .refine((value) => {
    try {
      const { hostname } = new URL(value);
      return hostname === "drive.google.com" || hostname === "docs.google.com";
    } catch {
      return false;
    }
  }, "Enter a valid Google Drive URL");

module.exports = {
  z,
  objectId,
  googleDriveUrl,
};
