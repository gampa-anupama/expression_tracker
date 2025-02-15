const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
});

const Video = mongoose.model("Video", VideoSchema);
module.exports = Video;
