// 贪吃蛇主逻辑（Canvas）
// 支持键盘 + WASD + 触摸滑动，速度可调

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const speedInput = document.getElementById('speed');
const speedDisplay = document.getElementById('speedDisplay');

let gridSize = 20; // 每格像素
let cols, rows;
let snake;
let apple;
let dir;
let nextDir;
let score;
let timerId;
let tickInterval = 1000 / 10; // 毫秒，初始速度 10
let running = false;

// 初始化网格大小以适配画布尺寸（确保为整格）
function resizeGrid() {
  const width = canvas.width;
  const height = canvas.height;
  cols = Math.floor(width / gridSize);
  rows = Math.floor(height / gridSize);
}

// 随机放苹果，确保不与蛇重合
function placeApple() {
  while (true) {
    const ax = Math.floor(Math.random() * cols);
    const ay = Math.floor(Math.random() * rows);
    if (!snake.some(p => p.x === ax && p.y === ay)) {
      apple = { x: ax, y: ay };
      break;
    }
  }
}

// 重置游戏
function resetGame() {
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
  tickInterval = 1000 / speed;
}

// 游戏循环（move + draw）
function gameTick() {
  // 处理方向
  dir = nextDir;

  // 计算新头
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // 墙体判断（游戏结束或穿墙 - 这里设为结束）
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
  // 背景
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制网格（可选）
  // ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  // for (let x = 0; x < cols; x++) {
  //   for (let y = 0; y < rows; y++) {
  //     ctx.strokeRect(x*gridSize, y*gridSize, gridSize, gridSize);
  //   }
  // }

  // 苹果
  ctx.fillStyle = '#ef4444';
  drawCell(apple.x, apple.y, '#ef4444');

  // 蛇
  for (let i = 0; i < snake.length; i++) {
    const p = snake[i];
    // 头部颜色更亮
    const color = i === 0 ? '#34d399' : '#10b981';
    drawCell(p.x, p.y, color, i === 0);
  }
}

// 在格子位置绘制方块
function drawCell(x, y, color, head = false) {
  const px = x * gridSize;
  const py = y * gridSize;
  ctx.fillStyle = color;
  if (head) {
    // 略作高亮与圆角
    roundRect(ctx, px + 1, py + 1, gridSize - 2, gridSize - 2, 4, true, false);
  } else {
    roundRect(ctx, px + 1, py + 1, gridSize - 2, gridSize - 2, 4, true, false);
  }
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
  // 在画布上显示提示
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  ctx.fillStyle = '#fff';
  ctx.font = '18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('游戏结束！点击 “开始 / 重置” 重玩', canvas.width / 2, canvas.height / 2 + 6);
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
    // 空格或回车开始/重置
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

// 处理画布像素比例以保证清晰
function fixCanvasDPI() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing coordinates
  // 调整 gridSize 以适配高分屏（保持逻辑格）
  // 保持 gridSize 为 20 CSS 像素：canvas 实际像素会被 transform 处理
}
window.addEventListener('resize', () => {
  fixCanvasDPI();
  resizeGrid();
  draw();
});

// 初始化
(function init(){
  // 确保 canvas CSS 尺寸（在页面中设置为 480x480）
  // Fix ratio then start
  fixCanvasDPI();
  resizeGrid();
  // draw 初始场景
  // 清空画布并显示提示
  ctx.fillStyle = '#081824';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#9ca3af';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('点击 "开始 / 重置" 开始游戏', canvas.width / 2, canvas.height / 2);
})();
