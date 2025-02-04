// Hand Model - TODO: change to your model
let HAND_MODEL =
	"https://teachablemachine.withgoogle.com/models/Ipr6tqTPJ/model.json";

// camera object
let mCamera;

// model object
let mModel;

// array to keep track of detected "things"
let mDetected = [];

let gameState = "waiting"; // waiting, countdown, result
let computerChoice = "";
let score = { player: 0, computer: 0 };
let countdownStart = 0;
let result = "";

// start camera and create model
function preload() {
	mCamera = createCapture(VIDEO, { flipped: true });
	mCamera.hide();

	mModel = ml5.imageClassifier(HAND_MODEL, { flipped: true });
}

// when classification is done, just copy result to mDetected
function updateDetected(detected) {
	mDetected = detected;
	mModel.classify(mCamera, updateDetected);
}

function setup() {
	// create p5js canvas
	createCanvas(windowWidth, windowHeight);

	// run the model once on camera image
	mModel.classify(mCamera, updateDetected);

	textAlign(CENTER);
	textSize(24);
}

function draw() {
	background(180, 200, 255);

	push();
	translate(width / 2, height / 3);
	scale(-1, 1);
	imageMode(CENTER);
	image(mCamera, 0, 0);
	pop();

	// determine game state
	switch (gameState) {
		case "waiting":
			text("Press SPACE to play!", width / 2, height - 60);
			break;

		case "countdown":
			let timeLeft = 3 - Math.floor((millis() - countdownStart) / 1000);
			if (timeLeft > 0) {
				text(timeLeft, width / 2, height - 60);
			} else {
				// determine winner
				computerChoice = ["Rock", "Paper", "Scissors"][floor(random(3))];
				let playerChoice = mDetected[0]?.label || "none";
				result = determineWinner(playerChoice, computerChoice);
				gameState = "result";
			}
			break;

		case "result":
			text(`Computer chose: ${computerChoice}`, width / 2, height - 100);
			text(`Result: ${result}`, width / 2, height - 60);
			text("Press SPACE to play again!", width / 2, height - 20);
			break;
	}

	// Show current detected gesture
	if (mDetected[0]) {
		text(`Current gesture: ${mDetected[0].label}`, width / 2, height - 140);
	}
}

function keyPressed() {
	if (key === " ") {
		if (gameState === "waiting" || gameState === "result") {
			gameState = "countdown";
			countdownStart = millis();
		}
	}
}

function determineWinner(playerChoice, computerChoice) {
	// Convert both choices to lowercase for consistent comparison
	playerChoice = playerChoice.toLowerCase();
	computerChoice = computerChoice.toLowerCase();

	console.log(`Player chose: ${playerChoice}`);
	console.log(`Computer chose: ${computerChoice}`);

	// Check for tie first
	if (playerChoice === computerChoice) {
		console.log("Result: Tie");
		return "It's a tie!";
	}

	const wins = {
		rock: "scissors",
		paper: "rock",
		scissors: "paper",
	};

	const playerWins = wins[playerChoice] === computerChoice;
	console.log(`Player wins? ${playerWins}`);

	return playerWins ? "You win!" : "Computer wins!";
}
