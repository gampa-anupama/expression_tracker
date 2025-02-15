const express = require("express");
const fs = require("fs");

const router = express.Router();

// Receive Captured Frames from Frontend
router.post("/save-frames", async (req, res) => {
  try {
    const { frames } = req.body;
    if (!frames || frames.length === 0) {
      return res.status(400).json({ message: "No frames received" });
    }

    const dir = "uploads/frames";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    frames.forEach((frame, index) => {
      const framePath = `${dir}/frame_${Date.now()}_${index}.png`;
      fs.writeFileSync(framePath, frame.replace(/^data:image\/png;base64,/, ""), "base64");
    });

    res.json({ message: "Frames saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving frames", error });
  }
});

module.exports = router;
