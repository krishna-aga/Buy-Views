const Submission = require("../models/Submission");
const { syncSubmissionViews } = require("../services/admin.service");

const DEFAULT_SYNC_CRON = "0 */6 * * *";

const getCutoffDate = () => {
  const lookbackDays = Number(process.env.YOUTUBE_SYNC_LOOKBACK_DAYS || 30);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
  return cutoffDate;
};

const syncActiveYoutubeSubmissions = async () => {
  const submissions = await Submission.find({
    platform: "youtube",
    status: "active",
    createdAt: { $gte: getCutoffDate() },
  }).select("_id");

  const results = {
    total: submissions.length,
    synced: 0,
    failed: 0,
  };

  for (const submission of submissions) {
    try {
      await syncSubmissionViews(submission._id);
      results.synced += 1;
    } catch (error) {
      results.failed += 1;
      console.error(`YouTube sync failed for submission ${submission._id}:`, error.message);
    }
  }

  return results;
};

const startYoutubeSyncJob = () => {
  const cron = require("node-cron");
  const schedule = process.env.YOUTUBE_SYNC_CRON || DEFAULT_SYNC_CRON;

  cron.schedule(schedule, async () => {
    try {
      const results = await syncActiveYoutubeSubmissions();
      console.log(
        `YouTube sync completed. Total: ${results.total}, synced: ${results.synced}, failed: ${results.failed}`
      );
    } catch (error) {
      console.error("YouTube sync job failed:", error.message);
    }
  });
};

module.exports = {
  syncActiveYoutubeSubmissions,
  startYoutubeSyncJob,
};
