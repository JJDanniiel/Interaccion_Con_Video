let square;
let path = [];
let movesLeft = 8; // Reduce the number of moves to 4
const squareSize = 100; // El ancho del cuadrado será igual al ancho de la parte vertical de la T
const moveSpeed = 8;
const canvasWidth = 600;
const canvasHeight = 600;
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
    createCanvas(canvasWidth, canvasHeight);

    // Create a container for the video
    const videoContainer = createDiv().id('videoContainer');
    videoContainer.position(10,10);

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
    background(255);

    // Draw the T shape
    fill(200);
    rect(width / 2 - 50, 0, 100, height / 2); // Parte vertical de la T
    rect(0, height / 2 - 50, width, 100); // Parte horizontal de la T

    // Draw the path
    stroke(0, 0, 255);
    strokeWeight(squareSize); // El trazado tendrá el mismo ancho que el cuadrado
    noFill();
    beginShape();
    for (let pos of path) {
        vertex(pos.x, pos.y);
    }
    endShape();

    // Draw the square
    fill(255, 0, 0);
    noStroke();
    rect(square.x - squareSize / 2, square.y - squareSize / 2, squareSize, squareSize);

    // Display moves left
    fill(0);
    noStroke();
    textSize(16);
    text(`Movimientos restantes: ${movesLeft}`, 10, height - 10);

    // Check if the game is won
    if (checkIfWon()) {
        gameWon = true;
        document.getElementById('message').innerText = "¡Ganaste!";
        noLoop(); // Stop the draw loop
    }

    // Check if the game is lost
    if (movesLeft <= 0 && !gameWon) {
        document.getElementById('message').innerText = "¡Perdiste!";
        noLoop(); // Stop the draw loop
    }

    // Move the square towards the target position
    if (moving) {
        moveSquare();
    }

    handleHandPose();

    // Display video feed for debugging
    image(video, 10, 10, 160, 120);
}

function handleHandPose() {
    if (hands.length > 0 && movesLeft > 0 && !moving && !gameWon) {
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
                movesLeft--;
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
    movesLeft = 8; // Reset the number of moves to 4
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