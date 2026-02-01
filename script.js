const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const card = document.getElementById("card");
const celebration = document.getElementById("celebration");
const confettiCanvas = document.getElementById("confettiCanvas");
const buttonRow = document.getElementById("buttonRow");

const proximityRadius = 140;
let lastMove = 0;

const getSafeBounds = () => {
  const padding = 20;
  const rowRect = buttonRow.getBoundingClientRect();
  const maxX = rowRect.width - noButton.offsetWidth - padding;
  const maxY = rowRect.height - noButton.offsetHeight - padding;
  return {
    minX: padding,
    minY: padding,
    maxX: Math.max(padding, maxX),
    maxY: Math.max(padding, maxY),
  };
};

const moveNoButton = () => {
  const now = performance.now();
  if (now - lastMove < 120) return;
  lastMove = now;

  const bounds = getSafeBounds();
  const randomX = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
  const randomY = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);

  noButton.style.left = `${randomX}px`;
  noButton.style.top = `${randomY}px`;

  noButton.classList.remove("is-jumping");
  void noButton.offsetWidth;
  noButton.classList.add("is-jumping");
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

const resetNoButton = () => {
  if (window.innerWidth <= 600) return;
  noButton.style.left = "";
  noButton.style.top = "";
};

const launchConfetti = () => {
  const ctx = confettiCanvas.getContext("2d");
  const resize = () => {
    confettiCanvas.width = confettiCanvas.offsetWidth;
    confettiCanvas.height = confettiCanvas.offsetHeight;
  };
  resize();

  const colors = ["#f8c8d8", "#fff6e9", "#d9b55e", "#fbe2eb"];
  const pieces = Array.from({ length: 120 }).map(() => ({
    x: Math.random() * confettiCanvas.width,
    y: Math.random() * confettiCanvas.height - confettiCanvas.height,
    size: 6 + Math.random() * 8,
    speed: 1 + Math.random() * 2.5,
    sway: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
  }));

  let frame = 0;
  const animate = () => {
    frame += 1;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += Math.sin(frame / 20) * piece.sway;
      piece.rotation += 0.03;

      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
      ctx.restore();

      if (piece.y > confettiCanvas.height + 20) {
        piece.y = -20;
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

window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("resize", resetNoButton);

resetNoButton();
