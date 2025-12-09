// 贪吃蛇主逻辑（Canvas） — 触控增强版 + DPI/网格稳健处理
// 支持键盘 + WASD + 触摸滑动 + pointer events，速度可调

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const speedInput = document.getElementById('speed');
const speedDisplay = document.getElementById('speedDisplay');

let gridSize = 20; // 每格（CSS像素）
let cols = 0, rows = 0;
let snake;
let apple;
let dir;
let nextDir;
let score;
let timerId;
let tickInterval = 1000 / 10; // 毫秒，初始速度 10
let running = false;

// 获取 canvas 的 CSS 大小（返回 CSS 像素）
function getCanvasCssSize() {
  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width || canvas.clientWidth || 480;
  const cssH = rect.height || canvas.clientHeight || 480;
  return { cssW, cssH };
}

// 处理画布像素比例以保证清晰（并保持 CSS 大小不变）
function fixCanvasDPI() {
  const dpr = window.devicePixelRatio || 1;
  const { cssW, cssH } = getCanvasCssSize();

  canvas.width = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));

  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// 初始化网格大小以适配画布 CSS 尺寸（使用 CSS 像素）
function resizeGrid() {
  const { cssW, cssH } = getCanvasCssSize();
  cols = Math.max(1, Math.floor(cssW / gridSize));
  rows = Math.max(1, Math.floor(cssH / gridSize));
}

// 随机放苹果，确保不与蛇重合；增加最大尝试次数防止死循环
function placeApple() {
  if (!cols || !rows) {
    apple = { x: 0, y: 0 };
    return;
  }
  const maxAttempts = 1000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ax = Math.floor(Math.random() * cols);
    const ay = Math.floor(Math.random() * rows);
    if (!snake.some(p => p.x === ax && p.y === ay)) {
      apple = { x: ax, y: ay };
      return;
    }
  }
  apple = { x: snake[0].x, y: snake[0].y };
}

// 重置游戏
function resetGame() {
  fixCanvasDPI();
  resizeGrid();

  snake = [];
  const startLen = 4;
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);
  for (let i = 0; i < startLen; i++) {
    snake.push({ x: startX - i, y: startY });
  }
  dir = { x: 1, y: 0 };
  nextDir = { ...dir };
  score = 0;
  placeApple();
  scoreEl.textContent = score;
  running = true;
  setTickFromSpeed();
  restartLoop();
}

// 设置 tick 时间（速度来自滑块）
function setTickFromSpeed() {
  const speed = parseInt(speedInput.value, 10);
  speedDisplay.textContent = speed;
  tickInterval = 1000 / Math.max(1, speed);
}

// 游戏循环（move + draw）
function gameTick() {
  dir = nextDir;

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    gameOver();
    return;
  }

  if (snake.some(p => p.x === head.x && p.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === apple.x && head.y === apple.y) {
    score += 1;
    scoreEl.textContent = score;
    placeApple();
  } else {
    snake.pop();
  }

  draw();
}

// 绘制场景
function draw() {
  const { cssW, cssH } = getCanvasCssSize();
  ctx.clearRect(0, 0, cssW, cssH);

  drawCell(apple.x, apple.y, '#ef4444');

  for (let i = 0; i < snake.length; i++) {
    const p = snake[i];
    const color = i === 0 ? '#34d399' : '#10b981';
    drawCell(p.x, p.y, color, i === 0);
  }
}

// 在格子位置绘制方块（使用 CSS 像素坐标）
function drawCell(x, y, color, head = false) {
  const px = x * gridSize;
  const py = y * gridSize;
  ctx.fillStyle = color;
  roundRect(ctx, px + 1, py + 1, gridSize - 2, gridSize - 2, 4);
}

// 辅助：绘制圆角矩形
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// 游戏结束
function gameOver() {
  running = false;
  clearInterval(timerId);
  const { cssW, cssH } = getCanvasCssSize();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, cssH / 2 - 30, cssW, 60);
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束！点击 “开始 / 重置” 重玩', cssW / 2, cssH / 2 + 6);
}

// 启动/重启循环
function restartLoop() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    if (running) gameTick();
  }, tickInterval);
}

// 键盘控制
window.addEventListener('keydown', (e) => {
  const k = e.key;
  if (k === 'ArrowUp' || k === 'w' || k === 'W') trySetDir(0, -1);
  if (k === 'ArrowDown' || k === 's' || k === 'S') trySetDir(0, 1);
  if (k === 'ArrowLeft' || k === 'a' || k === 'A') trySetDir(-1, 0);
  if (k === 'ArrowRight' || k === 'd' || k === 'D') trySetDir(1, 0);
  if (k === ' ' || k === 'Enter') {
    resetGame();
  }
});

// 禁止向相反方向立即掉头
function trySetDir(x, y) {
  if (!dir) { nextDir = { x, y }; return; }
  if (x === -dir.x && y === -dir.y) return;
  nextDir = { x, y };
}

// --- 触控 / pointer 逻辑（增强） ---
let touchStart = null;
let lastTouch = null;
const SWIPE_THRESHOLD = 6; // px, 减小阈值以便小幅滑动也能识别

// Touch events
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
  lastTouch = { ...touchStart };
}, { passive: true });

canvas.addEventListener('touchmove', (e) => {
  // 更新 lastTouch，便于快速滑动也能识别方向
  const t = e.touches[0];
  lastTouch = { x: t.clientX, y: t.clientY };
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  // 使用 lastTouch 如果可用，否则使用 changedTouches[0]
  const t = (lastTouch && lastTouch.x !== undefined) ? lastTouch : (e.changedTouches && e.changedTouches[0]) || null;
  if (!t) { touchStart = null; lastTouch = null; return; }
  const dx = t.x - touchStart.x;
  const dy = t.y - touchStart.y;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) >= SWIPE_THRESHOLD) {
    if (absX > absY) {
      trySetDir(dx > 0 ? 1 : -1, 0);
    } else {
      trySetDir(0, dy > 0 ? 1 : -1);
    }
  }
  touchStart = null;
  lastTouch = null;
}, { passive: true });

// Pointer events（更统一的处理，兼容某些浏览器/设备）
canvas.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch' || e.pointerType === 'pen' || e.pointerType === 'mouse') {
    touchStart = { x: e.clientX, y: e.clientY };
    lastTouch = { ...touchStart };
    // 捕获指针，确保 pointerup 在 canvas 上仍能触发
    try { canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId); } catch (err) {}
  }
});

canvas.addEventListener('pointermove', (e) => {
  if (!touchStart) return;
  lastTouch = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('pointerup', (e) => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x;
  const dy = e.clientY - touchStart.y;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) >= SWIPE_THRESHOLD) {
    if (absX > absY) {
      trySetDir(dx > 0 ? 1 : -1, 0);
    } else {
      trySetDir(0, dy > 0 ? 1 : -1);
    }
  }
  try { canvas.releasePointerCapture && canvas.releasePointerCapture(e.pointerId); } catch (err) {}
  touchStart = null;
  lastTouch = null;
});

canvas.addEventListener('pointercancel', () => {
  touchStart = null;
  lastTouch = null;
});
// --- end 触控 / pointer 逻辑 ---

// UI 连接
startBtn.addEventListener('click', () => resetGame());
speedInput.addEventListener('input', () => {
  setTickFromSpeed();
  if (running) restartLoop();
});

// 窗口尺寸变化时调整
window.addEventListener('resize', () => {
  fixCanvasDPI();
  resizeGrid();
  draw();
});

// 初始化
(function init(){
  fixCanvasDPI();
  resizeGrid();
  const { cssW, cssH } = getCanvasCssSize();
  ctx.fillStyle = '#081824';
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('点击 "开始 / 重置" 开始游戏', cssW / 2, cssH / 2);
})();
