const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const LEFT = { u: 159, l: 145 };
const RIGHT = { u: 386, l: 374 };

let lastLandmarks = null;
let frozenLandmarksFocus = null;
let frozenLandmarksLoaf = null;

let focusValue = null;
let loafValue = null;
let threshold = null;
let faceReady = false;

const captureFocusBtn = document.getElementById("captureFocus");
const captureLoafBtn = document.getElementById("captureLoaf");
const submitBtn = document.getElementById("submitCalibration");

captureFocusBtn.disabled = true;
captureLoafBtn.disabled = true;
submitBtn.disabled = true;

captureFocusBtn.addEventListener("click", () => capture("focus"));
captureLoafBtn.addEventListener("click", () => capture("loaf"));
submitBtn.addEventListener("click", submitCalibration);

// ---- FaceMesh (ONE instance)
// locateFile points to the local vendor directory so the WASM and packed assets
// are loaded from the site. If you didn't vendor the files, the HTML falls
// back to CDN for the main scripts, but it's best to vendor the wasm/assets
// into `frontend/vendor/mediapipe` for reliable hosting (see scripts/vendor_mediapipe.ps1).
const faceMesh = new FaceMesh({
  locateFile: f => `vendor/mediapipe/${f}`
});

faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true
});

faceMesh.onResults(results => {
  if (results.multiFaceLandmarks?.length) {
    lastLandmarks = results.multiFaceLandmarks[0];
    if (!faceReady) {
      faceReady = true;
      captureFocusBtn.disabled = false;
    }
  } else {
    lastLandmarks = null;
  }
});

// ---- Camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// ---- Flicker-free render loop
function drawLoop() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (lastLandmarks) {
    drawEyes(lastLandmarks, "red");
  }

  if (frozenLandmarksFocus) drawEyes(frozenLandmarksFocus, "lime");
  if (frozenLandmarksLoaf) drawEyes(frozenLandmarksLoaf, "lime");

  if (threshold !== null && lastLandmarks) {
    const currentOpenness =
      (eyeOpenness(lastLandmarks, LEFT) +
       eyeOpenness(lastLandmarks, RIGHT)) / 2;

    const stateImage = document.getElementById("stateImage");
    const stateText = document.getElementById("stateText");

    if (currentOpenness < threshold) {
      stateImage.src = "../assets/loafing.png";
      stateText.innerText = "Stop loafing 🍞";
    } else {
      stateImage.src = "../assets/focus.png";
      stateText.innerText = "Locked in 🔥";
    }
  }

  requestAnimationFrame(drawLoop);
}


video.addEventListener("loadedmetadata", () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const camera = new Camera(video, {
    onFrame: async () => {
      if (video.readyState >= 2) {
        await faceMesh.send({ image: video });
      }
    },
    width: video.videoWidth,
    height: video.videoHeight
  });

  camera.start();
  drawLoop();
});

// ---- Helpers
function drawEyes(lm, color = "red") {
  ctx.fillStyle = color;
  [LEFT.u, LEFT.l, RIGHT.u, RIGHT.l].forEach(i => {
    const p = lm[i];
    if (!p) return;
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function capture(type) {
  if (!lastLandmarks) return;

  if (type === "focus") {
    frozenLandmarksFocus = lastLandmarks.map(p => ({ ...p }));
    focusValue = (eyeOpenness(lastLandmarks, LEFT) + eyeOpenness(lastLandmarks, RIGHT)) / 2;
    captureFocusBtn.disabled = true;
    captureLoafBtn.disabled = false;
  } else {
    frozenLandmarksLoaf = lastLandmarks.map(p => ({ ...p }));
    loafValue = (eyeOpenness(lastLandmarks, LEFT) + eyeOpenness(lastLandmarks, RIGHT)) / 2;
    captureLoafBtn.disabled = true;
    submitBtn.disabled = false;
  }
}

function submitCalibration() {
  threshold = (focusValue + loafValue) / 2;
  document.getElementById("controls").remove();
  document.getElementById("stateText").innerText = "Calibration complete 🔥";
}

function eyeOpenness(lm, eye) {
  return Math.abs(lm[eye.u].y - lm[eye.l].y);
}
