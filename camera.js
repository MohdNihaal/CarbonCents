let videoStream;
let currentCamera = 'user';  // 'user' for front camera, 'environment' for back
const videoElement = document.getElementById('video-stream');
const zoomSlider = document.getElementById('zoom-slider');
const switchCameraBtn = document.getElementById('switch-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('captured-image');

async function startCamera() {
  const constraints = {
    video: {
      facingMode: currentCamera,
      zoom: zoomSlider.value
    }
  };
  try {
    videoStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = videoStream;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

// Switch Camera
switchCameraBtn.addEventListener('click', () => {
  currentCamera = currentCamera === 'user' ? 'environment' : 'user';
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
  }
  startCamera();
});

// Zoom Control
zoomSlider.addEventListener('input', (event) => {
  const track = videoStream.getVideoTracks()[0];
  const capabilities = track.getCapabilities();
  if (capabilities.zoom) {
    track.applyConstraints({ advanced: [{ zoom: event.target.value }] });
  }
});

// Capture Photo
captureBtn.addEventListener('click', () => {
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  capturedImage.src = canvas.toDataURL('image/png');
  capturedImage.style.display = 'block';
});

// Start Camera on Page Load
window.addEventListener('load', startCamera);
