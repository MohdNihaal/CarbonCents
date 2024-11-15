let model;
let videoStream;
let currentCamera = 'user'; // 'user' for front camera, 'environment' for back
const confidenceThreshold = 0.5;
const zoomSlider = document.getElementById('zoomSlider');
const switchCameraButton = document.getElementById('switchCameraButton');

// Load the COCO-SSD model
async function loadModel() {
    try {
        model = await cocoSsd.load();
        console.log("Model Loaded");
    } catch (error) {
        console.error("Error loading model:", error);
        document.getElementById('result').innerHTML = "Error loading model.";
    }
}

// Start video stream with selected camera and enable controls
async function startVideoStream() {
    resetDisplay();
    const constraints = {
        video: {
            facingMode: currentCamera,
            zoom: zoomSlider.value
        }
    };
    try {
        videoStream = await navigator.mediaDevices.getUserMedia(constraints);
        const video = document.getElementById('video');
        video.srcObject = videoStream;
        video.style.display = 'block';
        document.getElementById('captureButton').style.display = 'block';
        document.getElementById('startCameraButton').style.display = 'none';
        switchCameraButton.style.display = 'block';
        zoomSlider.style.display = 'block';
    } catch (error) {
        console.error("Error accessing the camera:", error);
        document.getElementById('result').innerHTML = "Error accessing the camera.";
    }
}

// Switch between front and back camera
switchCameraButton.addEventListener('click', async () => {
    currentCamera = currentCamera === 'user' ? 'environment' : 'user';
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    startVideoStream();
});

// Adjust zoom
zoomSlider.addEventListener('input', (event) => {
    const track = videoStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (capabilities.zoom) {
        track.applyConstraints({ advanced: [{ zoom: event.target.value }] });
    }
});

// Capture frame and detect objects
async function captureAndDetectObjects() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (model) {
        const predictions = await model.detect(canvas);
        console.log(predictions);
        const resultDiv = document.getElementById('result');
        const filteredPredictions = predictions.filter(prediction => prediction.score >= confidenceThreshold);
        
        if (filteredPredictions.length === 0) {
            resultDiv.innerHTML = "No objects detected above confidence threshold.";
        } else {
            resultDiv.innerHTML = filteredPredictions.map(prediction => 
                `${prediction.class}: ${Math.round(prediction.score * 100)}%`
            ).join('<br>');
        }

        // Draw bounding boxes
        filteredPredictions.forEach(prediction => {
            context.beginPath();
            context.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.fillStyle = 'red';
            context.stroke();
            context.fillText(prediction.class, prediction.bbox[0], prediction.bbox[1] - 5);
        });
    } else {
        console.error("Model is not loaded yet.");
    }
    stopVideoStream();
}

// Stop video stream and reset controls
function stopVideoStream() {
    const video = document.getElementById('video');
    video.style.display = 'none';
    document.getElementById('captureButton').style.display = 'none';
    document.getElementById('startCameraButton').style.display = 'block';
    switchCameraButton.style.display = 'none';
    zoomSlider.style.display = 'none';
    
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
}

function resetDisplay() {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('result').innerHTML = "";
}

// Event listeners
document.getElementById('startCameraButton').addEventListener('click', startVideoStream);
document.getElementById('captureButton').addEventListener('click', captureAndDetectObjects);

// Load the model on page load
loadModel();
