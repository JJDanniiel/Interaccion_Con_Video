
let handPose;
let video;
let hands = [];
let circleObj = {
  x: 320,
  y: 240,
  size: 50,
};

function preload() {
  // Load the handPose model
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(640, 480);
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // Start detecting hands from the webcam video
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw the controlled circle
  fill(255, 0, 0);
  noStroke();
  ellipse(circleObj.x, circleObj.y, circleObj.size);

  // Draw all the tracked hand points
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(keypoint.x, keypoint.y, 10);
    }

    // Control the circle using the index finger tip
    let indexFingerTip = hand.keypoints.find((k) => k.name === "index_finger_tip");
    if (indexFingerTip) {
      circleObj.x = map(indexFingerTip.x, 0, video.width, 0, width);
      circleObj.y = map(indexFingerTip.y, 0, video.height, 0, height);
    }
  }
}

// Callback function for when handPose outputs data
function gotHands(results) {
  // Save the output to the hands variable
  hands = results;
}
