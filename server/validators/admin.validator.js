const { z, objectId } = require("./common.validator");

const updateSubmissionViewsSchema = z.object({
  body: z.object({
    views: z.number().int().min(0, "Views cannot be negative"),
  }),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

const syncSubmissionSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

module.exports = {
  updateSubmissionViewsSchema,
  syncSubmissionSchema,
};
