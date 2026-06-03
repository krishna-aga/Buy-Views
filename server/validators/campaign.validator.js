const { z, objectId, googleDriveUrl } = require("./common.validator");

const campaignBody = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  clipDriveUrl: googleDriveUrl,
  budget: z.number().positive("Budget must be greater than 0"),
  payoutPer1000Views: z.number().positive("Payout rate must be greater than 0"),
  status: z.enum(["active", "paused", "completed", "cancelled"]).optional(),
});

const createCampaignSchema = z.object({
  body: campaignBody,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const updateCampaignSchema = z.object({
  body: campaignBody.partial().refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  }),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

const campaignIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: objectId,
  }),
  query: z.object({}).optional(),
});

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
  campaignIdSchema,
};
