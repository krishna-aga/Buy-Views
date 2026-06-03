const youtubeService = require("../services/youtube.service");

const connectYoutube = async (req, res) => {
  console.log("connectYoutube hit");
  const url = youtubeService.generateConnectUrl(req.user);
  console.log(url);
  res.redirect(url);
};

const youtubeCallback = async (req, res) => {
  const result = await youtubeService.handleYoutubeCallback(req.query);

  res.status(200).json({
    success: true,
    message: "YouTube account connected successfully",
    ...result,
  });
};

module.exports = {
  connectYoutube,
  youtubeCallback,
};
