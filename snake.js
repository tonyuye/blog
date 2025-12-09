// 贪吃蛇主逻辑（Canvas） — 修正版
// 支持键盘 + WASD + 触摸滑动，速度可调
// 更稳健地处理高 DPR / 移动端布局，避免 cols/rows 为 0 导致的无限循环

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
  // 回退到 clientWidth/clientHeight 或属性默认值，防止某些环境 rect 为 0
  const cssW = rect.width || canvas.clientWidth || 480;
  const cssH = rect.height || canvas.clientHeight || 480;
  return { cssW, cssH };
}

// 处理画布像素比例以保证清晰（并保持 CSS 大小不变）
function fixCanvasDPI() {
  const dpr = window.devicePixelRatio || 1;
  const { cssW, cssH } = getCanvasCssSize();

  // 设置 canvas 的实际像素尺寸为 CSS 尺寸 * dpr
  canvas.width = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));

  // 强制设置样式宽高为 CSS 像素（有助于布局稳定）
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';

  // 使用 scale/transform，把绘制坐标当作 CSS 像素来处理
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
    // 防御：如果网格还没准备好，放到 (0,0) 作为占位（会在下一次 resetGame 重新放置）
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
  // 极少数情况：找不到位置，退而求其次放到头后面
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
  // 处理方向
  dir = nextDir;

  // 计算新头
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // 墙体判断（游戏结束）
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    gameOver();
    return;
  }

  // 自己碰撞
  if (snake.some(p => p.x === head.x && p.y === head.y)) {
    gameOver();
    return;
  }

  // 推入新头
  snake.unshift(head);

  // 吃到苹果
  if (head.x === apple.x && head.y === apple.y) {
    score += 1;
    scoreEl.textContent = score;
    placeApple();
  } else {
    // 移除尾巴
    snake.pop();
  }

  draw();
}

// 绘制场景
function draw() {
  // 背景（使用 CSS 像素坐标）
  const { cssW, cssH } = getCanvasCssSize();
  ctx.clearRect(0, 0, cssW, cssH);

  // 苹果
  drawCell(apple.x, apple.y, '#ef4444');

  // 蛇
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

// 控制输入
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

// 触摸滑动支持
let touchStart = null;
canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStart = { x: t.clientX, y: t.clientY };
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (!touchStart) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStart.x;
  const dy = t.clientY - touchStart.y;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (Math.max(absX, absY) < 10) return;
  if (absX > absY) {
    trySetDir(dx > 0 ? 1 : -1, 0);
  } else {
    trySetDir(0, dy > 0 ? 1 : -1);
  }
  touchStart = null;
}, { passive: true });

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
  // 初始化画面提示
  const { cssW, cssH } = getCanvasCssSize();
  ctx.fillStyle = '#081824';
  ctx.fillRect(0, 0, cssW, cssH);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('点击 "开始 / 重置" 开始游戏', cssW / 2, cssH / 2);
})();