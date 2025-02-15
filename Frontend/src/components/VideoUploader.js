// import React, { useState } from "react";
// import axios from "axios";

// const VideoUploader = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [uploadMessage, setUploadMessage] = useState("");

//   const handleFileChange = (event) => {
//     setSelectedFile(event.target.files[0]);
//   };

//   const handleUpload = async () => {
//     const formData = new FormData();
//     formData.append("video", selectedFile);
//     formData.append("email", "anupamagampa@gmail.com"); // ✅ Required for admin lookup
//     // Ensure key matches multer

//     try {
//         const response = await axios.post("http://localhost:5000/api/upload", formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//         });
//         console.log("Upload successful:", response.data);
//     } catch (error) {
//         console.error("Upload failed:", error);
//     }
// };

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} accept="video/*" />
//       <button onClick={handleUpload}>Upload Video</button>
//       <p>{uploadMessage}</p>
//     </div>
//   );
// };

// export default VideoUploader;
import React, { useState, useRef } from "react";
import axios from "axios";

const VideoUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoURL, setVideoURL] = useState("");
  const [analysisResults, setAnalysisResults] = useState([]);
  const videoRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setVideoURL(URL.createObjectURL(file)); // Create a preview URL
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("video", selectedFile);
    const username = localStorage.getItem("username");
    formData.append("email",username ); // ✅ Required for admin email

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Uploaded to uploads folder successfully");
      console.log("Upload successful:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="video/*" />
      <button onClick={handleUpload}>Upload Video</button>
      {videoURL && (
        <div>
          <video ref={videoRef} src={videoURL} controls width="300"></video>
        </div>
      )}
      
    </div>
  );
};

export default VideoUploader;
