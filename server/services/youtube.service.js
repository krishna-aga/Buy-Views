const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { sanitizeUser } = require("./auth.service");

const YOUTUBE_CONNECT_SCOPE = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/youtube.readonly",
];

const createOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

const signYoutubeState = (user) =>
  jwt.sign(
    {
      purpose: "youtube-connect",
      userId: String(user._id),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

const verifyYoutubeState = (state) => {
  try {
    const decoded = jwt.verify(state, process.env.JWT_SECRET);

    if (decoded.purpose !== "youtube-connect") {
      throw new ApiError(400, "Invalid YouTube OAuth state");
    }

    return decoded;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "Invalid or expired YouTube OAuth state");
  }
};

const ensureGoogleOAuthConfigured = () => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REDIRECT_URI
  ) {
    throw new ApiError(500, "Google OAuth environment variables are not configured");
  }
};

const generateConnectUrl = (user) => {
  ensureGoogleOAuthConfigured();

  const oauth2Client = createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: YOUTUBE_CONNECT_SCOPE,
    state: signYoutubeState(user),
  });

};

const fetchGoogleProfile = async (oauth2Client) => {
  const oauth2 = google.oauth2({
    version: "v2",
    auth: oauth2Client,
  });

  const response = await oauth2.userinfo.get();
  return response.data;
};

const fetchYoutubeChannelId = async (oauth2Client) => {
  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const response = await youtube.channels.list({
    part: ["id", "snippet"],
    mine: true,
  });
  console.log(
    JSON.stringify(response.data, null, 2)
  );

  const channelId = response.data.items?.[0]?.id;

  if (!channelId) {
    throw new ApiError(400, "No YouTube channel found for this Google account");
  }

  return channelId;
};

const handleYoutubeCallback = async ({ code, state, error }) => {
  ensureGoogleOAuthConfigured();

  if (error) {
    throw new ApiError(400, `Google OAuth failed: ${error}`);
  }

  if (!code) {
    throw new ApiError(400, "Missing Google OAuth code");
  }

  if (!state) {
    throw new ApiError(400, "Missing Google OAuth state");
  }

  const { userId } = verifyYoutubeState(state);
  const user = await User.findById(userId).select("+youtubeRefreshToken");

  if (!user) {
    throw new ApiError(404, "User not found for YouTube connection");
  }

  if (user.role !== "promoter") {
    throw new ApiError(403, "Only promoters can connect a YouTube account");
  }

  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  console.log(tokens);
  oauth2Client.setCredentials(tokens);

  const [profile, channelId] = await Promise.all([
    fetchGoogleProfile(oauth2Client),
    fetchYoutubeChannelId(oauth2Client),
  ]);

  user.youtubeConnected = true;
  user.youtubeChannelId = channelId;
  user.googleId = profile.id || user.googleId;
  user.youtubeRefreshToken = tokens.refresh_token || user.youtubeRefreshToken;
  await user.save();

  return {
    user: sanitizeUser(user),
    channelId,
    tokens: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      token_type: tokens.token_type,
    },
  };
};

const extractYoutubeVideoId = (url) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.split("/").filter(Boolean)[0];
      return videoId || null;
    }

    if (!["youtube.com", "m.youtube.com"].includes(hostname)) {
      return null;
    }

    if (parsedUrl.pathname.startsWith("/shorts/")) {
      const videoId = parsedUrl.pathname.split("/")[2];
      return videoId || null;
    }

    if (parsedUrl.pathname === "/watch") {
      return parsedUrl.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
};

const getAuthenticatedYoutubeClient = (refreshToken) => {
  ensureGoogleOAuthConfigured();

  if (!refreshToken) {
    throw new ApiError(400, "YouTube refresh token is missing for this user");
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
};

const verifyYoutubeSubmissionOwnership = async (user, reelUrl) => {
  if (!user.youtubeConnected || !user.youtubeChannelId) {
    throw new ApiError(400, "Connect your YouTube account before submitting YouTube Shorts");
  }

  const videoId = extractYoutubeVideoId(reelUrl);

  if (!videoId) {
    throw new ApiError(400, "Unable to extract a YouTube video id from the submitted URL");
  }

  const youtube = getAuthenticatedYoutubeClient(user.youtubeRefreshToken);
  const response = await youtube.videos.list({
    part: ["snippet"],
    id: [videoId],
  });

  const video = response.data.items?.[0];

  if (!video) {
    throw new ApiError(404, "Submitted YouTube video was not found");
  }

  if (video.snippet?.channelId !== user.youtubeChannelId) {
    throw new ApiError(403, "This YouTube Short does not belong to your connected channel");
  }

  return {
    videoId,
    channelId: video.snippet.channelId,
  };
};

module.exports = {
  generateConnectUrl,
  handleYoutubeCallback,
  verifyYoutubeSubmissionOwnership,
  extractYoutubeVideoId,
};
