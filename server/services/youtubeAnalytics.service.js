const ApiError = require("../utils/ApiError");
const { getAuthenticatedYoutubeClient } = require("./youtube.service");

const getVideoViews = async ({ refreshToken, videoId }) => {
  const youtube = getAuthenticatedYoutubeClient(refreshToken);
  const response = await youtube.videos.list({
    part: ["statistics", "status"],
    id: [videoId],
  });

  const video = response.data.items?.[0];

  if (!video) {
    return {
      exists: false,
      views: 0,
    };
  }

  if (video.status?.privacyStatus === "private") {
    throw new ApiError(403, "Cannot sync views for a private YouTube Short");
  }

  return {
    exists: true,
    views: Number(video.statistics?.viewCount || 0),
  };
};

module.exports = {
  getVideoViews,
};
