const floatingLayer = document.getElementById('floatingLayer');
for (let i = 0; i < 24; i++) {
  const heart = document.createElement('span');
  heart.className = 'floaty';
  heart.textContent = '❤';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.fontSize = `${10 + Math.random() * 14}px`;
  heart.style.animationDuration = `${22 + Math.random() * 20}s`;
  heart.style.animationDelay = `${-Math.random() * 25}s`;
  floatingLayer.appendChild(heart);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('show'));
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const intro = document.getElementById('gameIntro');
const board = document.getElementById('gameBoard');
const result = document.getElementById('gameResult');
const flowerHost = document.getElementById('flower');
const instructionWrap = document.querySelector('.game__instruction-wrap');
const fallenPetals = document.getElementById('fallenPetals');

let petalsLeft = 15;
let clickCount = 0;
let gameStarted = false;

function petalPath(length = 136, width = 38, wobble = 4) {
  return `M 0 0 C ${-width * 0.85} ${-length * 0.18}, ${-width} ${-length * 0.72}, 0 ${-length} C ${width} ${-length * 0.72}, ${width * 0.85} ${-length * 0.18}, 0 0 Z`;
}

function createChamomileSVG(totalPetals = petalsLeft, size = 330) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('class', 'chamomile-svg');

  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
    <radialGradient id="coreGrad" cx="45%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#ffc400"/>
      <stop offset="58%" stop-color="#ffd94a"/>
      <stop offset="100%" stop-color="#ffef9a"/>
    </radialGradient>
    <filter id="petalShadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#8ea8bf" flood-opacity="0.22"/>
    </filter>
    <filter id="coreShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="b"/>
      <feOffset dx="0" dy="2"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.35"/></feComponentTransfer>
      <feBlend in="SourceGraphic" mode="multiply"/>
    </filter>`;
  svg.appendChild(defs);

  const g = document.createElementNS(ns, 'g');
  g.setAttribute('transform', 'translate(200 200)');

  for (let i = 0; i < totalPetals; i++) {
    const path = document.createElementNS(ns, 'path');
    const len = 138 + Math.random() * 24;
    const wid = 36 + Math.random() * 8;
    const a = (360 / totalPetals) * i + (Math.random() * 5 - 2.5);
    path.setAttribute('d', petalPath(len, wid));
    path.setAttribute('class', 'svg-petal');
    path.setAttribute('fill', '#ffffff');
    path.setAttribute('opacity', String(0.97 + Math.random() * 0.03));
    path.setAttribute('transform', `rotate(${a}) translate(0 12)`);
    path.dataset.angle = String(a);
    path.dataset.len = String(len);
    path.addEventListener('click', () => pluckPetal(path), { once: true });
    g.appendChild(path);
  }

  const core = document.createElementNS(ns, 'circle');
  core.setAttribute('r', '48');
  core.setAttribute('cx', '0'); core.setAttribute('cy', '0');
  core.setAttribute('fill', 'url(#coreGrad)');
  core.setAttribute('filter', 'url(#coreShadow)');
  core.setAttribute('class', 'svg-core');
  g.appendChild(core);

  svg.appendChild(g);
  return svg;
}

function buildFlower() {
  flowerHost.innerHTML = '';
  flowerHost.appendChild(createChamomileSVG());
}

function pluckPetal(petal) {
  if (!gameStarted) return;
  const rect = petal.getBoundingClientRect();
  const clone = petal.cloneNode(true);
  clone.classList.add('falling-petal');
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  document.body.appendChild(clone);

  petal.remove();
  petalsLeft -= 1;
  clickCount += 1;


  const isLast = petalsLeft === 0;
  result.textContent = isLast ? 'Долмочка вас очень очень любит!' : (clickCount % 2 ? 'Долмочка вас очень любит!' : 'Долмочка вас.. не любит? Попробуйте еще!');
  result.classList.add('show');
  if (isLast) result.classList.add('is-final');

  requestAnimationFrame(() => {
    const drift = (Math.random() * 180 - 90);
    const rotate = Math.random() * 220 - 110;
    const fallY = window.scrollY + document.documentElement.scrollHeight - 80;
    clone.style.transform = `translate(${drift}px, ${fallY - rect.top}px) rotate(${rotate}deg)`;
    clone.style.opacity = '.95';
  });

  setTimeout(() => {
    fallenPetals.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.left = `${rect.left + (Math.random() * 120 - 60)}px`;
    clone.style.top = `${Math.max(0, fallenPetals.offsetTop - 30 + Math.random() * 28)}px`;
    clone.style.transform = `rotate(${Math.random() * 100 - 50}deg)`;
    clone.style.transition = 'none';
  }, 1900);

  if (isLast) {
    document.getElementById('finale').classList.add('show-bouquet');
    setTimeout(() => document.getElementById('finale').scrollIntoView({ behavior: 'smooth', block: 'center' }), 850);
  }
}

document.querySelectorAll('[data-start-game]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (gameStarted) return;
    gameStarted = true;
    intro.hidden = true;
    board.hidden = false;
    instructionWrap.classList.add("show");
    result.textContent = "";
    result.classList.remove("show", "is-final");
    buildFlower();
  });
});

const bouquet = document.getElementById('bouquet');
for (let b = 0; b < 15; b++) {
  const item = document.createElement('div');
  item.className = 'bouquet-item';
  item.style.transform = `translateY(${Math.random() * 10}px) rotate(${Math.random() * 6 - 3}deg)`;
  item.appendChild(createChamomileSVG(12, 132));
  bouquet.appendChild(item);
}