/* ============================================
   PRESENTATION JAVASCRIPT
   Economical Bubble AI & Memory Appreciation
   ============================================ */

let currentSlide = 1;
const totalSlides = 15;
let autoPlay = false;
let autoInterval = null;
let qaMode = false;

// ── Init ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildDots();
  update();
  initCanvas();
  animateCounters();
  window.addEventListener('keydown', handleKeys);

  if (currentSlide === 6) {
      simulateRAM();
      drawRAMChart();
  }
});

// ── Slide Navigation ─────────────────────────

function startDemo() {
  goTo(1);
  setTimeout(() => goTo(2), 1500);
}

function toggleAuto() {
  autoPlay = !autoPlay;
  const btn = document.querySelector('button[onclick="toggleAuto()"]');

  if (autoPlay) {
    btn.innerHTML = '⏸ Stop Auto';
    btn.style.color = '#a855f7';
    autoInterval = setInterval(() => {
      if (currentSlide < totalSlides) {
        changeSlide(1);
      } else {
        toggleAuto();
      }
    }, 5000);
  } else {
    btn.innerHTML = '⏩ Auto Play';
    btn.style.color = '';
    clearInterval(autoInterval);
  }
}

function toggleQA() {
  qaMode = !qaMode;
  document.body.classList.toggle("qa-mode", qaMode);
  if (qaMode) {
    goTo(15);
  }
}

function changeSlide(dir) {
  const next = currentSlide + dir;
  if (next < 1 || next > totalSlides) return;
  goTo(next);
}

function goTo(index) {
  if (index === currentSlide) return;

  const current = document.getElementById(`slide-${currentSlide}`);
  const next = document.getElementById(`slide-${index}`);

  current.classList.remove('active', 'exit-left', 'exit-right');

  const direction = index > currentSlide ? 'exit-left' : 'exit-right';
  current.classList.add(direction);

  currentSlide = index;

  next.classList.remove('exit-left', 'exit-right');
  next.classList.add('active');

  update();

  if (currentSlide === 6) {
    setTimeout(animateCounters, 300);
    setTimeout(() => {
        simulateRAM();
        drawRAMChart();
    }, 100);
  }
}

function update() {
  // Progress bar
  const pct = ((currentSlide - 1) / (totalSlides - 1)) * 100;
  document.getElementById('progressBar').style.width = pct + '%';

  // Counter
  document.getElementById('slideCounter').textContent = `${currentSlide} / ${totalSlides}`;

  // Prev / Next buttons
  document.getElementById('prevBtn').disabled = currentSlide === 1;
  document.getElementById('nextBtn').disabled = currentSlide === totalSlides;

  // Dots
  document.querySelectorAll('.dot-item').forEach((d, i) => {
    d.classList.toggle('active', i + 1 === currentSlide);
  });
}

function buildDots() {
  const container = document.getElementById('slideDots');
  container.innerHTML = ''; // Очистка на всякий случай
  for (let i = 1; i <= totalSlides; i++) {
    const d = document.createElement('div');
    d.className = 'dot-item' + (i === 1 ? ' active' : '');
    d.title = `Slide ${i}`;
    d.addEventListener('click', () => goTo(i));
    container.appendChild(d);
  }
}

function handleKeys(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
    e.preventDefault();
    changeSlide(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    e.preventDefault();
    changeSlide(-1);
  } else if (e.key === 'Home') {
    goTo(1);
  } else if (e.key === 'End') {
    goTo(totalSlides);
  }
}

// ── Realistic RAM Chart Simulation (Slide 6) ───────────────────

let ramData = [];

function simulateRAM() {
  ramData = [];
  const totalSteps = 60;

  const base = 35;

  let normal = base;
  let tokens = 0;

  for (let i = 0; i <= totalSteps; i++) {

    if (i < 10) {
      tokens += 120;
      normal = base + tokens * 0.015;
    }

    else if (i < 30) {
      tokens += 180;
      normal = base + tokens * 0.016;
    }

    else if (i < 40) {
      tokens += 220;
      normal = base + tokens * 0.018;
    }

    else {
      normal = 70 + Math.sin(i * 0.4) * 3;
    }

    normal = Math.min(normal, 80);

    let bubbleAI =
      45 +
      Math.sin(i * 0.5) * 2 +
      (Math.random() * 1.2);

    ramData.push({
      time: i,
      normal,
      bubbleAI
    });
  }
}

function drawRAMChart() {
  const canvas = document.getElementById("ramChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const parent = canvas.parentElement;

  const dpr = window.devicePixelRatio || 1;
  const rect = parent.getBoundingClientRect();

  if (rect.width === 0) return;

  canvas.width = rect.width * dpr;
  canvas.height = 300 * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 300;

  ctx.clearRect(0, 0, width, height);

  const maxY = 80; // 80 GB limit
  const padding = 40;
  const scaleX = (width - padding * 2) / (ramData.length - 1);
  const scaleY = (height - padding * 2) / maxY;

  // Draw Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
      let y = padding + i * ((height - padding * 2) / 4);
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);

      // Y-Axis Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(`${maxY - i * 20} GB`, 5, y + 4);
  }
  ctx.stroke();

  // Function to draw smoothed, glowing lines
  function drawLine(key, color, glowColor) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    ctx.shadowBlur = 15;
    ctx.shadowColor = glowColor;

    ramData.forEach((d, i) => {
      const x = padding + i * scaleX;
      const y = height - padding - (d[key] * scaleY);

      if (i === 0) {
          ctx.moveTo(x, y);
      } else {
          // Bezier curve for smooth lines
          const prevX = padding + (i - 1) * scaleX;
          const prevY = height - padding - (ramData[i - 1][key] * scaleY);
          const cpX = prevX + (x - prevX) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
      }
    });
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow
  }

  // Draw Lines
  drawLine("normal", "#ef4444", "rgba(239, 68, 68, 0.6)");
  drawLine("bubbleAI", "#06b6d4", "rgba(6, 182, 212, 0.8)");

  // Draw Legend
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(padding + 20, 10, 12, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Static Allocation (Normal)', padding + 40, 21);

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(padding + 220, 10, 12, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText('Bubble AI (Adaptive)', padding + 240, 21);
}

// ── Animated Counters ─────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = target / 50;
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.round(current);
      if (current >= target) clearInterval(interval);
    }, 20);
  });
}

// ── Particle Canvas Background ────────────────
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  window.addEventListener('resize', () => {
      resize();
      if (currentSlide === 6) drawRAMChart();
  });

  class Particle {
    constructor() { this.reset(true); }

    reset(initial = false) {
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.r = Math.random() * 2 + 0.5;
      this.speed = Math.random() * 0.4 + 0.1;
      this.dx = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.05;
      this.color = this.randomColor();
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
    }

    randomColor() {
      const colors = [
        '99,102,241', '139,92,246', '236,72,153', '6,182,212', '16,185,129'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.y -= this.speed;
      this.x += this.dx;
      this.pulse += this.pulseSpeed;
      if (this.y < -10) this.reset();
    }

    draw() {
      const alpha = this.opacity * (0.8 + 0.2 * Math.sin(this.pulse));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.018)';
    ctx.lineWidth = 1;
    const spacing = 80;

    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(animate);
  }
  animate();
}

// ── Touch / Swipe Support ─────────────────────
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = touchStartX - e.changedTouches[0].clientX;
  const dy = touchStartY - e.changedTouches[0].clientY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    changeSlide(dx > 0 ? 1 : -1);
  }
}, { passive: true });