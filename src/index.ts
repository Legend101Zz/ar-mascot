import * as THREE from "three";
import * as ZapparThree from "@zappar/zappar-threejs";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ZapparWebGLSnapshot from "@zappar/webgl-snapshot";
// import ZapparSharing from '@zappar/sharing';
import * as ZapparVideoRecorder from "@zappar/video-recorder";
import "./index.css";

let allowTap = false;
if (ZapparThree.browserIncompatible()) {
  // The browserIncompatibleUI() function shows a full-page dialog that informs the user
  // they're using an unsupported browser, and provides a button to 'copy' the current page
  // URL so they can 'paste' it into the address bar of a compatible alternative.
  ZapparThree.browserIncompatibleUI();

  // If the browser is not compatible, we can avoid setting up the rest of the page
  // so we throw an exception here.
  throw new Error("Unsupported browser");
}

// ZapparThree provides a LoadingManager that shows a progress bar while
// the assets are downloaded. You can use this if it's helpful, or use
// your own loading UI - it's up to you :-)
const manager = new ZapparThree.LoadingManager();

// Construct our ThreeJS renderer and scene as usual
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
document.body.appendChild(renderer.domElement);

// As with a normal ThreeJS scene, resize the canvas if the window resizes
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Create a Zappar camera that we'll use instead of a ThreeJS camera
const camera = new ZapparThree.Camera();

// In order to use camera and motion data, we need to ask the users for permission
// The Zappar library comes with some UI to help with that, so let's use it
ZapparThree.permissionRequestUI().then((granted) => {
  // If the user granted us the permissions we need then we can start the camera
  // Otherwise let's them know that it's necessary with Zappar's permission denied UI
  if (granted) {
    camera.start();
    allowTap = true;
  } else ZapparThree.permissionDeniedUI();
});

// The Zappar component needs to know our WebGL context, so set it like this:
ZapparThree.glContextSet(renderer.getContext());

// Set the background of our scene to be the camera background texture
// that's provided by the Zappar camera
scene.background = camera.backgroundTexture;

// Create an InstantWorldTracker and wrap it in an InstantWorldAnchorGroup for us
// to put our ThreeJS content into
const instantTracker = new ZapparThree.InstantWorldTracker();
const instantTrackerGroup = new ZapparThree.InstantWorldAnchorGroup(
  camera,
  instantTracker
);

// Add our instant tracker group into the ThreeJS scene
scene.add(instantTrackerGroup);

const model = new URL("../assets/waywin.glb", import.meta.url).href;

const gltfLoader = new GLTFLoader(manager);
let mixer: any;
let mymodel: any;
gltfLoader.load(
  model,
  (gltf) => {
    mymodel = gltf.scene;
    instantTrackerGroup.add(gltf.scene);
    gltf.scene.visible = false;
    gltf.scene.scale.set(20, 20, 20);
    gltf.scene.position.set(0.5, -1.4, 0);
    console.log(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    let action = mixer.clipAction(gltf.animations[0]);
    action.play();
  },
  undefined,
  () => {
    console.log("An error ocurred loading the GLTF model");
  }
);

//====================UI frame begin=================================//
const topLogo = new URL("../assets/logo.png", import.meta.url).href;
// const bottomText = new URL("../assets/bottom.png", import.meta.url).href;

const loader = new THREE.TextureLoader(manager);

const texture = loader.load(topLogo);
const fire = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(),
  new THREE.MeshBasicMaterial({ map: texture, transparent: true })
);
fire.scale.set(0.3, 0.17, 1);
fire.position.set(0, 0.44, -1);
scene.add(fire);

// const bottom = new THREE.Mesh(
//     new THREE.PlaneBufferGeometry(),
//     new THREE.MeshBasicMaterial({ map: loader.load(bottomText), transparent: true })
// );
// bottom.scale.set(0.6, 0.6, 0.6);
// bottom.position.set(0, -0.28, -1);
// scene.add(bottom);
// console.log(bottom);
//========================UI Frame end===============================//

const directionalLight = new THREE.DirectionalLight("white", 0.8);
directionalLight.position.set(0, 0, 1000);
directionalLight.lookAt(0, 0, 0);
instantTrackerGroup.add(directionalLight);

const ambientLight = new THREE.AmbientLight("white", 0.4);
instantTrackerGroup.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(0, 100, 200);
instantTrackerGroup.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.8);
spotLight.position.set(0, 25, 500);
spotLight.target.position.set(0, -0.5, 0);
instantTrackerGroup.add(spotLight);

let hasPlaced = false;
const placeButton =
  document.getElementById("tap-to-place") || document.createElement("div");

// document.addEventListener('click', (event) => {
//   hasPlaced = true;
//   mymodel.visible = true;
//   placeButton.remove();
// });

// Get a reference to the 'Snapshot' button so we can attach a 'click' listener
// const snapButton =
//   document.getElementById("image") || document.createElement("div");
// snapButton.addEventListener("click", () => {
//   // Create an image from the canvas
//   const planeGeometry = new THREE.PlaneGeometry(2, 2);
//   const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
//   const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
//   scene.add(planeMesh);

//   // Temporarily set the camera to focus on the planeMesh
//   const originalCameraPosition = camera.position.clone();
//   camera.position.set(
//     planeMesh.position.x,
//     planeMesh.position.y,
//     planeMesh.position.z + 5
//   );

//   camera.lookAt(planeMesh.position);
//   // Render the scene
//   renderer.render(scene, camera);
//   const dataURL = renderer.domElement.toDataURL("image/png");
//   // Take snapshot
//   // ZapparSharing({
//   //   data: dataURL,
//   // });
//   ZapparWebGLSnapshot({
//     data: dataURL,
//   });

//   // Capture the element by its ID
//   const zapparSaveButton = document.getElementById("zapparSaveButton");
//   const zapparShareButton = document.getElementById("zapparShareButton");
//   console.log(zapparSaveButton, zapparShareButton);
//   if (zapparSaveButton) {
//     //Create a new SVG image content
//     //   const newSVGContent = `
//     //   <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="64" height="64" viewBox="0 0 40 40">
//     //     <path d="M 12.5 1 C 11.125 1 10 2.125 10 3.5 C 10 3.980469 10.144531 4.425781 10.378906 4.808594 L 8.054688 7 L 5.949219 7 C 5.714844 5.863281 4.703125 5 3.5 5 C 2.125 5 1 6.125 1 7.5 C 1 8.875 2.125 10 3.5 10 C 4.703125 10 5.714844 9.136719 5.949219 8 L 8.054688 8 L 10.40625 10.148438 C 10.152344 10.539063 10 11 10 11.5 C 10 12.875 11.125 14 12.5 14 C 13.875 14 15 12.875 15 11.5 C 15 10.125 13.875 9 12.5 9 C 11.984375 9 11.5 9.15625 11.101563 9.429688 L 9 7.507813 L 9 7.476563 L 11.0625 5.539063 C 11.472656 5.824219 11.964844 6 12.5 6 C 13.875 6 15 4.875 15 3.5 C 15 2.125 13.875 1 12.5 1 Z M 12.5 2 C 13.335938 2 14 2.664063 14 3.5 C 14 4.335938 13.335938 5 12.5 5 C 11.664063 5 11 4.335938 11 3.5 C 11 2.664063 11.664063 2 12.5 2 Z M 3.5 6 C 4.335938 6 5 6.664063 5 7.5 C 5 8.335938 4.335938 9 3.5 9 C 2.664063 9 2 8.335938 2 7.5 C 2 6.664063 2.664063 6 3.5 6 Z M 12.5 10 C 13.335938 10 14 10.664063 14 11.5 C 14 12.335938 13.335938 13 12.5 13 C 11.664063 13 11 12.335938 11 11.5 C 11 10.664063 11.664063 10 12.5 10 Z"></path>

//     //   <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="black" font-size="10" font-weight="bold">SHARE</text>
//     //   </svg>
//     // `;

//     const newSVGContent = `
//     <button style="width: 850px; height:50px; padding: 10px; border-radius: 20px; background: linear-gradient(to right, #ff8c00, #ff2d55); color: white; border: none; cursor: pointer;">
//     Share
//   </button>
// `;
//     // Set the new content for the zapparSaveButton
//     zapparSaveButton.innerHTML = newSVGContent;
//     //@ts-ignore
//     zapparShareButton.innerHTML = newSVGContent;
//     // Change the src attribute to the new image URL
//   }

//   // Reset the camera and visibility of the planeMesh
//   camera.position.copy(originalCameraPosition);
//   camera.lookAt(0, 0, 0);
// });

// sharing functionality

// Function to save the image
function saveImage(dataURL: any) {
  //const snapshotCanvas = renderer.domElement;
  //const dataURL = snapshotCanvas.toDataURL("image/png");
  console.log("Data URL:", dataURL);
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "snapshot.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function shareImage(dataURL: any) {
  const imageData = dataURL.split(",")[1]; // Extract the base64-encoded image data
  const binaryImageData = atob(imageData); // Decode base64 to binary
  const uint8Array = new Uint8Array(binaryImageData.length);

  for (let i = 0; i < binaryImageData.length; i++) {
    uint8Array[i] = binaryImageData.charCodeAt(i);
  }

  const blob = new Blob([uint8Array], { type: "image/png" });
  const file = new File([blob], "shared-image.png", { type: "image/png" });

  if (navigator.share) {
    navigator
      .share({
        title: "Shared Image",
        text: "Check out this image!",
        files: [file],
      })
      .then(() => console.log("Shared successfully"))
      .catch((error) => console.error("Error sharing:", error));
  } else {
    console.warn("Web Share API not supported");
  }
}

// Function to capture the current content of the canvas and share it
function captureAndShare() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Set the canvas dimensions to match the renderer's size
  canvas.width = renderer.domElement.width;
  canvas.height = renderer.domElement.height;

  // Draw the current content of the renderer onto the canvas
  context.drawImage(renderer.domElement, 0, 0);

  // Get the data URL of the canvas
  const dataURL = canvas.toDataURL("image/png");

  // Call the shareImage function with the captured dataURL
  shareImage(dataURL);
}

// Function to display the overlay with captured image
function showOverlay(dataURL: any) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "space-between";

  const image = new Image();
  image.src = dataURL;
  image.style.width = "80%";
  image.style.maxHeight = "70%";
  overlay.appendChild(image);

  const buttonsContainer = document.createElement("div");
  buttonsContainer.style.width = "80%"; // Adjust the width of the buttons container
  buttonsContainer.style.display = "flex";
  buttonsContainer.style.flexDirection = "column"; // Stack buttons vertically
  buttonsContainer.style.alignItems = "center";
  buttonsContainer.style.padding = "20px";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.style.width = "80%"; // Make the button wider
  saveButton.style.padding = "15px 20px";
  saveButton.style.borderRadius = "10px";
  saveButton.style.background = "linear-gradient(to right, #ff8c00, #ff2d55)";
  saveButton.style.color = "white";
  saveButton.style.marginBottom = "10px"; // Add some spacing between buttons
  saveButton.addEventListener("click", () => {
    saveImage(dataURL);
    closeOverlay();
  });
  buttonsContainer.appendChild(saveButton);

  const shareButton = document.createElement("button");
  shareButton.textContent = "Share";
  shareButton.style.width = "80%"; // Make the button wider
  shareButton.style.padding = "15px 20px";
  shareButton.style.borderRadius = "10px";
  shareButton.style.background = "linear-gradient(to right, #36d1dc, #5b86e5)";
  shareButton.style.color = "white";
  shareButton.addEventListener("click", () => {
    console.log("Share button clicked");
    shareImage(dataURL);
    closeOverlay();
  });
  buttonsContainer.appendChild(shareButton);

  overlay.appendChild(buttonsContainer);

  document.body.appendChild(overlay);
}

// Function to close the overlay
function closeOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    document.body.removeChild(overlay);
  }
}

// Get a reference to the 'Snapshot' button so we can attach a 'click' listener
const snapButton =
  document.getElementById("image") || document.createElement("div");
snapButton.addEventListener("click", () => {
  // Create an image from the canvas
  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(planeMesh);

  // Temporarily set the camera to focus on the planeMesh
  const originalCameraPosition = camera.position.clone();
  camera.position.set(
    planeMesh.position.x,
    planeMesh.position.y,
    planeMesh.position.z + 5
  );

  camera.lookAt(planeMesh.position);
  // Render the scene
  renderer.render(scene, camera);
  const dataURL = renderer.domElement.toDataURL("image/png");
  // Take snapshot

  // Call the showOverlay function to display the captured image
  showOverlay(dataURL);

  // Reset the camera and visibility of the planeMesh
  camera.position.copy(originalCameraPosition);
  camera.lookAt(0, 0, 0);
});

// video capture
const canvas =
  document.querySelector("canvas") || document.createElement("canvas");
const videoBtn =
  document.getElementById("video") || document.createElement("div");
let isRecording = false;
ZapparVideoRecorder.createCanvasVideoRecorder(canvas, {}).then((recorder) => {
  videoBtn.addEventListener("click", () => {
    if (!isRecording) {
      isRecording = true;
      recorder.start();
    } else {
      isRecording = false;
      recorder.stop();
    }
  });

  recorder.onComplete.bind(async (res) => {
    ZapparWebGLSnapshot({
      data: await res.asDataURL(),
    });
  });
});

// Use a function to render our scene as usual
function render(): void {
  if (!hasPlaced) {
    // If the user hasn't chosen a place in their room yet, update the instant tracker
    // to be directly in front of the user
    instantTrackerGroup.setAnchorPoseFromCameraOffset(0, 0, -5);
  }
  if (allowTap && !hasPlaced) {
    document.addEventListener("click", (event) => {
      hasPlaced = true;
      mymodel.visible = true;
      placeButton.remove();
    });
  }
  // The Zappar camera must have updateFrame called every frame
  camera.updateFrame(renderer);

  if (mixer) mixer.update(0.01);

  // Call render() again next frame
  requestAnimationFrame(render);

  // Draw the ThreeJS scene in the usual way, but using the Zappar camera
  renderer.render(scene, camera);
}

// Start things off
render();
