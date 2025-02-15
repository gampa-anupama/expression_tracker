import React, { useEffect, useRef, useState } from "react";

const VideoPlayer = () => {
  const [videoSrc, setVideoSrc] = useState(null);
  const [frames, setFrames] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  let captureInterval = useRef(null);

  // Fetch latest video when the component mounts
  useEffect(() => {
    fetch("http://localhost:5000/api/latest-video")
      .then((res) => res.json())
      .then((data) => {
        if (data.videoPath) {
          setVideoSrc(`http://localhost:5000/${data.videoPath}`);
        }
      })
      .catch((error) => console.error("Error fetching video:", error));
  }, []);

  // Start capturing frames every 3 seconds when video plays
  const startCapturing = () => {
    if (!videoRef.current || !canvasRef.current) return;

    captureInterval.current = setInterval(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameData = canvas.toDataURL("image/png");
      setFrames((prevFrames) => [...prevFrames, frameData]);
    }, 3000); // Capture frame every 3 seconds
  };

  // Stop capturing frames
  const stopCapturing = () => {
    if (captureInterval.current) clearInterval(captureInterval.current);
  };

  // Send captured frames to backend when "Analyze" is clicked
  const analyzeFrames = async () => {
    if (frames.length === 0) return alert("No frames captured!");

    try {
      const response = await fetch("http://localhost:5000/api/save-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Frames sent for analysis!");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error sending frames:", error);
    }
  };

  return (
    <div>
      {videoSrc ? (
        <>
          <video
            ref={videoRef}
            src={videoSrc}
            controls
            onPlay={startCapturing}
            onPause={stopCapturing}
            onEnded={stopCapturing}
            width="600"
          />
          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          <button onClick={analyzeFrames}>Analyze</button>
        </>
      ) : (
        <p>No video available. Upload a video first.</p>
      )}
    </div>
  );
};

export default VideoPlayer;
