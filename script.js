const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const card = document.getElementById("card");
const celebration = document.getElementById("celebration");
const confettiCanvas = document.getElementById("confettiCanvas");
const buttonRow = document.getElementById("buttonRow");

const proximityRadius = 100;
let isRunning = false;
let lastMove = 0;

// Create floating hearts background
const createFloatingHearts = () => {
  const container = document.querySelector('.page');
  const heartSymbols = ['♥', '♡', '💕', '💗', '💖'];
  
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDelay = `${Math.random() * 8}s`;
    heart.style.animationDuration = `${6 + Math.random() * 6}s`;
    heart.style.fontSize = `${14 + Math.random() * 20}px`;
    heart.style.opacity = 0.4 + Math.random() * 0.3;
    container.appendChild(heart);
  }
};

// Create sparkle effect around No button when it runs
const createSparkles = (x, y) => {
  const sparkleSymbols = ['✨', '💫', '⭐', '✧'];
  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.textContent = sparkleSymbols[Math.floor(Math.random() * sparkleSymbols.length)];
    sparkle.style.left = `${x + (Math.random() - 0.5) * 60}px`;
    sparkle.style.top = `${y + (Math.random() - 0.5) * 60}px`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }
};

const getSafeBounds = () => {
  const padding = 30;
  const cardRect = card.getBoundingClientRect();
  const btnWidth = noButton.offsetWidth;
  const btnHeight = noButton.offsetHeight;

  return {
    minX: padding,
    minY: padding,
    maxX: cardRect.width - btnWidth - padding,
    maxY: cardRect.height - btnHeight - padding,
  };
};

// Create trail effect as button moves
const createTrail = (startX, startY, endX, endY) => {
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    setTimeout(() => {
      const progress = i / steps;
      const x = startX + (endX - startX) * progress;
      const y = startY + (endY - startY) * progress;
      
      const dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 600);
    }, i * 40);
  }
};

const moveNoButton = () => {
  const now = performance.now();
  if (now - lastMove < 400) return;
  lastMove = now;

  // Get current position for trail
  const currentRect = noButton.getBoundingClientRect();
  const startX = currentRect.left + currentRect.width / 2;
  const startY = currentRect.top + currentRect.height / 2;

  // Create sparkle effect at current position
  createSparkles(startX, startY);

  // Make absolute on first run - just position it, don't move yet
  if (!isRunning) {
    const rect = noButton.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const cardStyle = window.getComputedStyle(card);
    const borderLeft = parseFloat(cardStyle.borderLeftWidth) || 0;
    const borderTop = parseFloat(cardStyle.borderTopWidth) || 0;
    
    noButton.style.left = `${rect.left - cardRect.left - borderLeft}px`;
    noButton.style.top = `${rect.top - cardRect.top - borderTop}px`;
    noButton.classList.add("is-running");
    
    // Create a placeholder to keep the Yes button from moving
    const placeholder = document.createElement('div');
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    buttonRow.appendChild(placeholder);
    
    isRunning = true;
    return;
  }

  // Add wobble animation
  noButton.classList.remove('wobble');
  void noButton.offsetWidth;
  noButton.classList.add('wobble');

  // Calculate new position - SHORTER distance (80-150px away)
  const cardRect = card.getBoundingClientRect();
  const currentLeft = parseFloat(noButton.style.left) || 0;
  const currentTop = parseFloat(noButton.style.top) || 0;
  
  const yesRect = yesButton.getBoundingClientRect();
  const yesBox = {
    x: yesRect.left - cardRect.left - 40,
    y: yesRect.top - cardRect.top - 40,
    w: yesRect.width + 80,
    h: yesRect.height + 80,
  };

  const padding = 30;
  const maxX = cardRect.width - noButton.offsetWidth - padding;
  const maxY = cardRect.height - noButton.offsetHeight - padding;

  let newX, newY;
  let tries = 0;

  do {
    // Move 80-150px in a random direction (shorter distance)
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 70;
    
    newX = currentLeft + Math.cos(angle) * distance;
    newY = currentTop + Math.sin(angle) * distance;
    
    // Clamp to bounds
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));

    const overlapsYes =
      newX < yesBox.x + yesBox.w &&
      newX + noButton.offsetWidth > yesBox.x &&
      newY < yesBox.y + yesBox.h &&
      newY + noButton.offsetHeight > yesBox.y;

    if (!overlapsYes) break;
    tries++;
  } while (tries < 20);

  // Create trail from old position to new position
  const endX = cardRect.left + newX + noButton.offsetWidth / 2;
  const endY = cardRect.top + newY + noButton.offsetHeight / 2;
  createTrail(startX, startY, endX, endY);

  noButton.style.left = `${newX}px`;
  noButton.style.top = `${newY}px`;
};

const handleMouseMove = (event) => {
  const rect = noButton.getBoundingClientRect();
  const buttonCenterX = rect.left + rect.width / 2;
  const buttonCenterY = rect.top + rect.height / 2;
  const distance = Math.hypot(
    event.clientX - buttonCenterX,
    event.clientY - buttonCenterY
  );

  if (distance < proximityRadius) {
    moveNoButton();
  }
};

const launchConfetti = () => {
  const ctx = confettiCanvas.getContext("2d");
  const resize = () => {
    confettiCanvas.width = confettiCanvas.offsetWidth;
    confettiCanvas.height = confettiCanvas.offsetHeight;
  };
  resize();

  const colors = ["#f8c8d8", "#fff6e9", "#d9b55e", "#fbe2eb", "#ffb6c1"];
  const pieces = Array.from({ length: 150 }).map(() => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    size: 6 + Math.random() * 10,
    speed: 1.5 + Math.random() * 3,
    sway: Math.random() * 2.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
  }));

  let frame = 0;
  const animate = () => {
    frame++;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += Math.sin(frame / 18) * piece.sway;
      piece.rotation += 0.04;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      ctx.restore();

      if (piece.y > confettiCanvas.height + 20) {
        piece.y = -20;
        piece.x = Math.random() * confettiCanvas.width;
      }
    });

    requestAnimationFrame(animate);
  };

  animate();
  window.addEventListener("resize", resize);
};

yesButton.addEventListener("click", () => {
  card.classList.add("hidden");
  celebration.classList.remove("hidden");
  launchConfetti();
});

noButton.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  moveNoButton();
});

document.addEventListener("mousemove", handleMouseMove);

// Initialize floating hearts
createFloatingHearts();
