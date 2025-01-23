let square;
let path = [];
const squareSize = 100; // El ancho del cuadrado será igual al ancho de la parte vertical de la T
const moveSpeed = 5;
const canvasWidth = 380;
const canvasHeight = 500;
let targetPosition;
let moving = false;
let gameWon = false;
let touchedTop = false;
let touchedLeft = false;
let touchedRight = false;
let video;
let handPose;
let hands = [];
let previousIndexFingerX = null;
let previousIndexFingerY = null;

function preload() {
    handPose = ml5.handPose({flipped: true});
}

function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('gameCanvas'); // Vincula el lienzo al div con id "gameCanvas"
    
    // Create a container for the video
    const videoContainer = createDiv().id('videoContainer');
    videoContainer.position(10, 10);

    // Detect video & load ML model
    video = createCapture(VIDEO, () => {
        video.size(320, 240);
        video.parent('videoContainer');
    });
    video.hide();
    
    handPose.detectStart(video, gotHands);

    resetGame();
    document.getElementById('resetButton').addEventListener('click', resetGame);
}

function gotHands(results) {
    hands = results;
}

function draw() {
    background(52, 73, 94);

    // Draw the T shape
    fill(100);
    rect(width / 2 - 50, 0, 100, height / 2); // Parte vertical de la T
    rect(0, height / 2 - 50, width, 100); // Parte horizontal de la T

    // Draw the path
    stroke(26, 188, 156);
    strokeWeight(squareSize); // El trazado tendrá el mismo ancho que el cuadrado
    noFill();
    beginShape();
    for (let pos of path) {
        vertex(pos.x, pos.y);
    }
    endShape();

    // Draw the square
    fill(231, 76, 60);
    noStroke();
    rect(square.x - squareSize / 2, square.y - squareSize / 2, squareSize, squareSize);

    // Check if the game is won
    if (checkIfWon() && !gameWon) {
        gameWon = true;
        document.getElementById('message').innerText = "¡Ganaste!";
        // Trigger confetti
        triggerConfetti();
    }

    // Move the square towards the target position
    if (moving) {
        moveSquare();
    }

    handleHandPose();

    // Display video feed for debugging
    image(video, 110, 350, 160, 120);
}

function handleHandPose() {
    if (hands.length > 0 && !moving && !gameWon) {
        const indexFinger = hands[0].keypoints[8];
        const currentX = indexFinger.x;
        const currentY = indexFinger.y;

        if (previousIndexFingerX !== null && previousIndexFingerY !== null) {
            const deltaX = currentX - previousIndexFingerX;
            const deltaY = currentY - previousIndexFingerY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 10) {
                    // Move right
                    targetPosition = createVector(width, square.y);
                } else if (deltaX < -10) {
                    // Move left
                    targetPosition = createVector(0, square.y);
                }
            } else {
                if (deltaY > 10) {
                    // Move down
                    targetPosition = createVector(square.x, height / 2);
                } else if (deltaY < -10) {
                    // Move up
                    targetPosition = createVector(square.x, 0);
                }
            }

            if (targetPosition && isValidMove(targetPosition)) {
                moving = true;
            }
        }

        previousIndexFingerX = currentX;
        previousIndexFingerY = currentY;
    }
}

function moveSquare() {
    let distance = p5.Vector.sub(targetPosition, square);
    if (distance.mag() <= moveSpeed) {
        square.set(targetPosition);
        path.push(square.copy());
        moving = false;
        updateTouchedEdges();
    } else {
        distance.setMag(moveSpeed);
        square.add(distance);
        path.push(square.copy());
    }
}

function isValidMove(pos) {
    // Check if the position is within the bounds of the T shape
    if (
        (pos.x >= width / 2 - 50 && pos.x <= width / 2 + 50 && pos.y >= 0 && pos.y <= height / 2) ||
        (pos.y >= height / 2 - 50 && pos.y <= height / 2 + 50 && pos.x >= 0 && pos.x <= width)
    ) {
        return true;
    }
    return false;
}

function updateTouchedEdges() {
    if (square.y === 0) {
        touchedTop = true;
    }
    if (square.x === 0) {
        touchedLeft = true;
    }
    if (square.x === width) {
        touchedRight = true;
    }
}

function checkIfWon() {
    // Check if all three edges (top, left, right) have been touched
    return touchedTop && touchedLeft && touchedRight;
}

function resetGame() {
    square = createVector(width / 2, height / 2);
    path = [square.copy()];
    moving = false;
    gameWon = false;
    touchedTop = false;
    touchedLeft = false;
    touchedRight = false;
    previousIndexFingerX = null;
    previousIndexFingerY = null;
    document.getElementById('message').innerText = "";
    loop(); // Restart the draw loop
}

function triggerConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        // Launch confetti from the top-center of the video feed
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 }
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 }
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}