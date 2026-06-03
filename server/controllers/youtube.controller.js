const youtubeService = require("../services/youtube.service");

const connectYoutube = async (req, res) => {
  console.log("connectYoutube hit");
  const url = youtubeService.generateConnectUrl(req.user);
  console.log(url);
  res.redirect(url);
};

const youtubeCallback = async (req, res) => {
  const result = await youtubeService.handleYoutubeCallback(req.query);
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  if (req.accepts("html")) {
    return res.redirect(`${clientUrl}/?youtube=connected`);
  }

  res.status(200).json({
    success: true,
    message: "YouTube account connected successfully",
    user: result.user,
    channelId: result.channelId,
  });
};

module.exports = {
  connectYoutube,
  youtubeCallback,
};
