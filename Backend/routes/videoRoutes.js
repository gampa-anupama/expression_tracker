// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const AdminDetails = require("../models/adminModel"); // Ensure correct model import

// const router = express.Router();

// // Configure Multer
// const storage = multer.diskStorage({
//   destination: "uploads/videos", // ✅ Ensure this folder exists
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// // ✅ Backend Route to Handle Video Uploads
// router.post("/upload", upload.single("video"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // Store the video path in MongoDB under AdminDetails
//     const videoPath = `/uploads/${req.file.filename}`;

//     const admin = await AdminDetails.findOne({ admin_email: req.body.email });
//     if (!admin) {
//       return res.status(404).json({ error: "Admin not found" });
//     }

//     admin.video.push({
//       filename: req.file.filename,
//       fileUrl: videoPath,
//     });

//     await admin.save();

//     res.json({ message: "Video uploaded successfully", videoPath });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// router.post("/analyze-video", async (req, res) => {
//     const { videoId } = req.body;
  
//     try {
//       const video = await Video.findById(videoId);
//       if (!video) return res.status(404).json({ error: "Video not found" });
  
//       const videoPath = video.path;
//       const screenshotsFolder = path.join("screenshots", videoId);
  
//       if (!fs.existsSync(screenshotsFolder)) fs.mkdirSync(screenshotsFolder, { recursive: true });
  
//       const outputPattern = path.join(screenshotsFolder, "screenshot-%03d.png");
  
//       ffmpeg(videoPath)
//         .output(outputPattern)
//         .outputOptions(["-vf", "fps=1/3"]) // Take a screenshot every 3 sec
//         .on("end", async () => {
//           const files = fs.readdirSync(screenshotsFolder);
//           const screenshotPaths = files.map(file => path.join(screenshotsFolder, file));
  
//           video.screenshots = screenshotPaths;
//           await video.save();
  
//           res.json({ message: "Screenshots extracted", screenshots: screenshotPaths });
//         })
//         .on("error", err => res.status(500).json({ error: err.message }))
//         .run();
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });
  

// module.exports = router;
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const axios = require("axios");

const router = express.Router();const AdminDetails = require("../models/adminModel");

// ffmpeg.setFfmpegPath("/usr/bin/ffmpeg"); // For Linux/macOS


// ffmpeg()
//   .input("test.mp4")
//   .output("output.png")
//   .on("end", () => console.log("FFmpeg is working!"))
//   .on("error", (err) => console.error("FFmpeg error:", err))
//   .run();

// Configure Multer for Video Storage
const storage = multer.diskStorage({
  destination: "uploads/videos",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 📌 Route to Upload Video and Store in MongoDB
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const videoPath = `/uploads/videos/${req.file.filename}`;

    // Find admin and store video details
    const admin = await AdminDetails.findOne({ admin_email: req.body.email });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    admin.video.push({ filename: req.file.filename, fileUrl: videoPath });
    await admin.save();

    res.json({ message: "Video uploaded successfully", videoPath });
    
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
