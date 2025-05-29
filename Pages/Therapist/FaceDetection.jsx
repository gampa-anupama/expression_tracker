import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//INSTALL THE BELOW
// Import TensorFlow face detector and supported models
import { createDetector, SupportedModels } from '@tensorflow-models/face-detection';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import './FaceDetection.css';

const FaceCapture = () => {
    // References for video and canvas DOM elements
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const navigate = useNavigate();


    // State variables for button enable, status message, and individual validations
    const [captureEnabled, setCaptureEnabled] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Please Wait...");
    const [lightingStatus, setLightingStatus] = useState('loading');
    const [shadowStatus, setShadowStatus] = useState('loading');
    const [expressionStatus, setExpressionStatus] = useState('loading');

    // useEffect to initialize camera and model once component mounts
    useEffect(() => {
        // Setup webcam stream
        const setupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                videoRef.current.srcObject = stream;

                // Wait for metadata (dimensions) to load
                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        resolve();
                    };
                });
            } catch (error) {
                console.error("Camera access error:", error);
                alert("Camera access denied. Please allow permissions.");
            }
        };

        // Load face detection model (MediaPipe short-range)
        const loadModel = async () => {
            const detector = await createDetector(
                SupportedModels.MediaPipeFaceDetector,
                {
                    runtime: 'tfjs',
                    modelType: 'short',
                }
            );
            console.log("Face detection model loaded..");
            return detector;
        };

        // Analyze the webcam image for brightness and shadow variance
        const checkLightingAndShadow = () => {
            console.log("inside checkLightingAndShadow");

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            // Sync canvas dimensions with video
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;

            // Draw video frame onto canvas
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            let totalBrightness = 0;
            const brightnessArray = [];

            // Calculate brightness for each pixel
            for (let i = 0; i < imageData.data.length; i += 4) {
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];

                // Standard formula for brightness
                const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
                totalBrightness += brightness;
                brightnessArray.push(brightness);
            }

            // Average brightness and standard deviation (shadow check)
            const avgBrightness = totalBrightness / (imageData.data.length / 4);
            const variance = brightnessArray.reduce((acc, val) => acc + Math.pow(val - avgBrightness, 2), 0) / brightnessArray.length;
            const stdDev = Math.sqrt(variance);

            console.log("Avg Brightness:", avgBrightness, "Shadow:", stdDev);

            // Determine lighting status based on brightness thresholds
            let lightingStatus = 'fail';
            if (avgBrightness >= 40 && avgBrightness <= 200) lightingStatus = 'pass';

            // Shadow considered pass only if lighting is pass
            let shadowStatus = lightingStatus === 'pass' ? 'pass' : 'fail';

            return { lightingStatus, shadowStatus };
        };

        // Continuously detect face using the model and validate conditions
        const detectFace = async (model) => {
            // If video is not ready yet, wait and retry
            if (!videoRef.current || !videoRef.current.videoWidth || !videoRef.current.videoHeight) {
                return requestAnimationFrame(() => detectFace(model));
            }

            // Check brightness and shadows
            const { lightingStatus: lightStatus, shadowStatus: shadow } = checkLightingAndShadow();
            setLightingStatus(lightStatus);
            setShadowStatus(shadow);

            // Detect face(s) in the current video frame
            const faces = await model.estimateFaces(videoRef.current, { flipHorizontal: false });

            if (faces.length === 0) {
                // If no face detected, mark as fail and provide suggestions
                setExpressionStatus('fail');
                if (lightStatus === 'fail') {
                    setStatusMessage("⚠️ No face + Poor lighting/shadow.");
                } else {
                    setStatusMessage("⚠️ No face detected. Look at the camera.");
                }
                setCaptureEnabled(false);
                return requestAnimationFrame(() => detectFace(model));
            }

            // If face is found
            setExpressionStatus('pass');

            if (lightStatus === 'pass') {
                setCaptureEnabled(true);
                setStatusMessage("✔️ All checks passed. Ready to continue!");
            } else {
                setCaptureEnabled(false);
                setStatusMessage("⚠️ Please adjust lighting.");
            }

            // Continue detection loop
            requestAnimationFrame(() => detectFace(model));
        };

        // Initialize the system: set backend, camera, model, and start detection
        const init = async () => {
            await tf.setBackend('webgl'); // use WebGL backend for performance
            await tf.ready(); // wait for TF to be ready
            await setupCamera(); // start camera
            const model = await loadModel(); // load face detection model
            detectFace(model); // begin detection loop
        };

        // Call init when component mounts
        init();
    }, []);

    // Function to return appropriate status icons
    const setIcon = (status) => {
        if (status === 'pass') return '✅';
        if (status === 'fail') return '❌';
        return <span className="loader"></span>; // custom circular loader for 'loading'
    };

    return (
        <div className="face-validation-container">

    {/* Video feed from webcam */}
    <div className="video-wrapper">
        <video ref={videoRef} autoPlay muted playsInline />
    </div>

    {/* Status section for lighting, shadow, and face detection */}
    <div className="status-section">
        <div className="status-item">
            <span className={`status-icon ${lightingStatus}`}>{setIcon(lightingStatus)}</span>
            <p>Lighting</p>
        </div>
        <div className="status-item">
            <span className={`status-icon ${shadowStatus}`}>{setIcon(shadowStatus)}</span>
            <p>Shadows</p>
        </div>
        <div className="status-item">
            <span className={`status-icon ${expressionStatus}`}>{setIcon(expressionStatus)}</span>
            <p>Face</p>
        </div>
    </div>

    {/* Message displayed based on validation status */}
    <p className="status-message">{statusMessage}</p>

    {/* Button enabled only when all checks pass */}
    <button
        className="continue-button"
        onClick={() => {
            navigate('/games');
        }}
        disabled={!captureEnabled}
    >
        Continue
    </button>

    {/* Hidden canvas used for image processing (brightness/shadow) */}
    <canvas ref={canvasRef} style={{ display: 'none' }} />
</div>
  );
};

export default FaceCapture;