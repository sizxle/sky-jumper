const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -10;
const PLATFORM_WIDTH = 85;
const PLATFORM_HEIGHT = 15;

let player = {
  x: canvas.width / 2 - PLAYER_WIDTH / 2,
  y: canvas.height - 100,
  vx: 0,
  vy: 0,
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  isJumping: false,
  grounded: false,
};

let platforms = [];
let coins = [];
let score = 0;
let coinScore = 0;

function drawPlayer() {
  let img = document.getElementById("playerImg");
  ctx.drawImage(img, player.x, player.y, player.width, player.height);
}

function createPlatform(x, y) {
  x = Math.max(10, Math.min(x, canvas.width - PLATFORM_WIDTH - 10));
  return { x, y, width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT };
}

function drawPlatforms() {
  let img = document.getElementById("platformImg");
  platforms.forEach((p) => ctx.drawImage(img, p.x, p.y, p.width, p.height));
}

function drawCoins() {
  let img = document.getElementById("coinImg");
  coins.forEach((c) => ctx.drawImage(img, c.x, c.y, 20, 20));
}

function initPlatforms() {
  let step = canvas.height / 5;
  for (let i = 0; i < 6; i++) {
    let x = Math.random() * (canvas.width - PLATFORM_WIDTH);
    let y = canvas.height - i * step;
    platforms.push(createPlatform(x, y));
    if (Math.random() > 0.5) {
      coins.push({ x: x + 30, y: y - 25 });
    }
  }
}

function handlePlayerMovement() {
  player.vy += GRAVITY;
  player.y += player.vy;
  player.x += player.vx;
  player.grounded = false; // Reset grounded

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;

  if (player.y > canvas.height) resetGame();

  platforms.forEach((p) => {
    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height > p.y &&
      player.y < p.y + p.height
    ) {
      if (player.vy > 0 && player.y + player.height <= p.y + player.vy) {
        player.y = p.y - player.height;
        player.vy = 0;
        player.grounded = true; // Player is on platform
        score++;
        document.getElementById("score").textContent = score;
      }
    }
  });

  // Collision with coins
  coins = coins.filter((c) => {
    if (
      player.x < c.x + 20 &&
      player.x + player.width > c.x &&
      player.y < c.y + 20 &&
      player.y + player.height > c.y
    ) {
      coinScore++;
      document.getElementById("coins").textContent = coinScore;
      return false;
    }
    return true;
  });
}

function movePlatformsAndCoins() {
  if (player.y < canvas.height / 2) {
    let dy = canvas.height / 2 - player.y;
    player.y = canvas.height / 2;

    platforms.forEach((p) => (p.y += dy));
    coins.forEach((c) => (c.y += dy));
  }

  platforms = platforms.filter((p) => p.y < canvas.height);
  while (platforms.length < 6) {
    let x = Math.random() * (canvas.width - PLATFORM_WIDTH);
    let y = platforms.length ? platforms[platforms.length - 1].y - 120 : -100;
    platforms.push(createPlatform(x, y));
    if (Math.random() > 0.5) {
      coins.push({ x: x + 30, y: y - 25 });
    }
  }
}

function gameLoop() {
  ctx.fillStyle = "#2196f3";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawCoins();
  drawPlayer();
  handlePlayerMovement();
  movePlatformsAndCoins();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
  player.y = canvas.height - 100;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  platforms = [];
  coins = [];
  score = 0;
  coinScore = 0;
  document.getElementById("score").textContent = 0;
  document.getElementById("coins").textContent = 0;
  initPlatforms();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") player.vx = -5;
  if (e.key === "ArrowRight") player.vx = 5;
  if (e.key === " " && player.grounded) {
    player.vy = JUMP_STRENGTH;
    player.grounded = false;
  }
});
window.addEventListener("keyup", () => (player.vx = 0));

function preloadAssets(callback) {
  const playerImg = new Image();
  const platformImg = new Image();
  const coinImg = new Image();

  playerImg.id = "playerImg";
  platformImg.id = "platformImg";
  coinImg.id = "coinImg";

  playerImg.src = "assets/player.png";
  platformImg.src = "assets/platform.png";
  coinImg.src = "assets/coin.png";

  document.body.appendChild(playerImg);
  document.body.appendChild(platformImg);
  document.body.appendChild(coinImg);

  let loaded = 0;
  const check = () => {
    loaded++;
    if (loaded === 3) callback();
  };
  playerImg.onload = check;
  platformImg.onload = check;
  coinImg.onload = check;
}

preloadAssets(() => {
  initPlatforms();
  gameLoop();
});
