let square; // Forma del cuadrado
let path = []; // Arreglo para almacenar el camino recorrido por el cuadrado
const squareSize = 100; // El ancho del cuadrado será igual al ancho de la parte vertical
const moveSpeed = 10; // Velocidad de movimiento del cuadrado
const canvasWidth = 380; // Ancho del lienzo
const canvasHeight = 500; // Alto del lienzo
let targetPosition; // Posición objetivo a la que se moverá el cuadrado
let moving = false; // Esto indica si el cuadrado se está moviendo
let gameWon = false; // Esto indica si el juego ha sido ganado
let touchedTop = false; // Esto indica si el borde superior ha sido tocado
let touchedLeft = false; // Esto indica si el borde izquierdo ha sido tocado
let touchedRight = false; // Esto indica si el borde derecho ha sido tocado
let video; 
let handPose; // Objeto de detección de poses de manos
let hands = []; // Arreglo para almacenar las manos detectadas
let previousIndexFingerX = null; // Posición X anterior del dedo índice
let previousIndexFingerY = null; // Posición Y anterior del dedo índice
let currentLevel = 1; // Nivel actual del juego

function preload() {
    handPose = ml5.handPose({ flipped: true }); // Cargar el modelo de detección de poses de manos
}

function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight); // Crear el lienzo
    canvas.parent('gameCanvas'); // Vincula el lienzo al div con id "gameCanvas"

    // Se crea un contenedor para el video
    const videoContainer = createDiv().id('videoContainer');
    videoContainer.position(10, 10);

    // Con esto se detecta el video y carga el modelo de ml5
    video = createCapture(VIDEO, () => {
        video.size(320, 240);
        video.parent('videoContainer');
    });
    video.hide();

    handPose.detectStart(video, gotHands); // Inicia la detección de manos

    resetGame(); // Reinicia el juego

    document.getElementById('resetButton').addEventListener('click', resetGame);
    document.getElementById('nextLevelButton').addEventListener('click', () => {
        if (currentLevel < 2) {
            currentLevel++;
            resetGame();
        }
    });

    document.getElementById('prevLevelButton').addEventListener('click', () => {
        if (currentLevel > 1) {
            currentLevel--;
            resetGame();
        }
    });
}

function gotHands(results) {
    hands = results; // Actualiza el arreglo de manos detectadas
}

function drawLevel1() {
    // Dibuja la forma de la T invertida
    fill(100);
    rect(width / 2 - 50, 0, 100, height / 2);
    rect(0, height / 2 - 50, width, 100);
}

function drawLevel2() {
    // Dibujar la forma de la J, aún en proceso de ver como hacerla funcionar
    fill(100);
    rect(width / 2 - 50, 0, 100, height / 2); // Parte vertical de la J
    rect(0, height - 100, width / 2, 100); // Parte horizontal de la J
}

function draw() {
    background(52, 73, 94); 

    // Dibuja el nivel actual
    if (currentLevel === 1) {
        drawLevel1();
    } else if (currentLevel === 2) {
        drawLevel2();
    }

    // Dibuja el camino del cuadrado
    stroke(26, 188, 156);
    strokeWeight(squareSize);
    noFill();
    beginShape();
    for (let pos of path) {
        vertex(pos.x, pos.y);
    }
    endShape();

    // Aquí se dibuja el cuadrado
    fill(231, 76, 60);
    noStroke();
    rect(square.x - squareSize / 2, square.y - squareSize / 2, squareSize, squareSize);

    // Verifica si el juego está ganado
    if (checkIfWon() && !gameWon) {
        gameWon = true;
        document.getElementById('message').innerText = "¡Ganaste!";
        triggerConfetti();
    }

    // Mueve el cuadrado hacia la posición objetivo
    if (moving) {
        moveSquare();
    }

    handleHandPose(); // Maneja la detección de poses de manos

    // Muestra la alimentación de video para depuración
    image(video, 110, 350, 160, 120);
}

function handleHandPose() {
    if (hands.length > 0 && !moving && !gameWon) {
        const indexFinger = hands[0].keypoints[8]; // De aquí se obtiene la posición del dedo índice
        const currentX = indexFinger.x;
        const currentY = indexFinger.y;

        if (previousIndexFingerX !== null && previousIndexFingerY !== null) {
            const deltaX = currentX - previousIndexFingerX;
            const deltaY = currentY - previousIndexFingerY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 10) {
                    // Mover a la derecha
                    targetPosition = createVector(width, square.y);
                } else if (deltaX < -10) {
                    // Mover a la izquierda
                    targetPosition = createVector(0, square.y);
                }
            } else {
                if (deltaY > 10) {
                    // Mover hacia abajo
                    targetPosition = createVector(square.x, height / 2);
                } else if (deltaY < -10) {
                    // Mover hacia arriba
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
    let distance = p5.Vector.sub(targetPosition, square); // Calcular la distancia hacia la posición objetivo
    if (distance.mag() <= moveSpeed) {
        square.set(targetPosition); // Actualiza la posición del cuadrado
        path.push(square.copy()); // Añade la nueva posición al camino
        moving = false;
        updateTouchedEdges(); // Actualiza los bordes tocados
    } else {
        distance.setMag(moveSpeed); // Se ajusta la magnitud de la distancia
        square.add(distance); // Mueve el cuadrado
        path.push(square.copy()); // Añade la nueva posición al camino
    }
}

function isValidMove(pos) {
  if (currentLevel === 1) {
    // Límite para la forma de la T invertida
    if (
      (pos.x >= width / 2 - 50 && pos.x <= width / 2 + 50 && pos.y >= 0 && pos.y <= height / 2) ||
      (pos.y >= height / 2 - 50 && pos.y <= height / 2 + 50 && pos.x >= 0 && pos.x <= width)
    ) {
      return true;
    }
  } else if (currentLevel === 2) {
    // Límite para la forma de la J, en proceso
    if (
      (pos.x >= width / 2 - 50 && pos.x <= width / 2 + 50 && pos.y >= 0 && pos.y <= height / 2) || // Parte vertical
      (pos.x >= width / 2 - 50 && pos.x <= width / 2 + 50 && pos.y >= height / 2 && pos.y <= height / 2 + 100) // Parte horizontal
    ) {
      return true;
    }
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
    // Se verifica si se han tocado todos los bordes necesarios
    return touchedTop && touchedLeft && touchedRight;
}

function resetGame() {
    square = createVector(width / 2, height / 2); // Reinicia la posición del cuadrado
    path = [square.copy()]; // Reinicia el camino
    moving = false;
    gameWon = false;
    touchedTop = false;
    touchedLeft = false;
    touchedRight = false;
    previousIndexFingerX = null;
    previousIndexFingerY = null;
    document.getElementById('message').innerText = "";
    loop(); // Reinicia el bucle de dibujo
}

function triggerConfetti() {
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        // Se lanza confeti desde la parte superior del video cuando ganan el nivel
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
    })();
}