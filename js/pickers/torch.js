import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'torch';
export const label = 'Torch snuff';

function uid() {
  return 'torch_' + Math.random().toString(36).slice(2, 9);
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function makeFlame(ns) {
  const el = document.createElement('div');
  el.style.cssText =
    'width:46px;height:62px;margin-bottom:-8px;transform-origin:50% 90%;' +
    'animation:' + ns + '_flicker 0.28s ease-in-out infinite alternate;' +
    'transition:opacity 0.35s, transform 0.35s, filter 0.35s;';
  el.innerHTML =
    '<svg viewBox="0 0 46 62" width="46" height="62" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + ns + '_f" x1="50%" y1="100%" x2="50%" y2="0%">' +
          '<stop offset="0%" stop-color="#ff3b30"/>' +
          '<stop offset="45%" stop-color="#ff9500"/>' +
          '<stop offset="100%" stop-color="#fff36a"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M23 60 C8 48 6 32 14 18 C16 28 22 30 20 12 C28 22 30 8 32 18 C40 30 40 46 23 60 Z" ' +
        'fill="url(#' + ns + '_f)" stroke="#1b110a" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<path d="M23 54 C16 46 16 36 20 28 C22 34 26 34 24 24 C28 32 30 40 23 54 Z" ' +
        'fill="#fff8c8" opacity="0.85"/>' +
    '</svg>';
  return el;
}

function makeSmoke(ns) {
  const el = document.createElement('div');
  el.style.cssText =
    'width:46px;height:62px;margin-bottom:-8px;opacity:0;pointer-events:none;' +
    'transition:opacity 0.3s;';
  el.innerHTML =
    '<svg viewBox="0 0 46 62" width="46" height="62" aria-hidden="true">' +
      '<g fill="#c9c4b8" stroke="#1b110a" stroke-width="1.4" opacity="0.7">' +
        '<ellipse class="' + ns + '_puff" cx="18" cy="40" rx="8" ry="6"/>' +
        '<ellipse class="' + ns + '_puff" cx="28" cy="32" rx="7" ry="5"/>' +
        '<ellipse class="' + ns + '_puff" cx="22" cy="22" rx="6" ry="5"/>' +
      '</g>' +
    '</svg>';
  return el;
}

/** Hall of torches: flames snuff one by one until the last light names the pick. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #2a1608 0%, #070402 72%)';
  const ns = uid();

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + ns + '_flicker {' +
      'from { transform: scale(1,1) translateY(0) rotate(-3deg); }' +
      'to { transform: scale(1.08,1.14) translateY(-4px) rotate(4deg); }' +
    '}' +
    '@keyframes ' + ns + '_puff {' +
      '0% { transform: translateY(0); opacity:0.8 }' +
      '100% { transform: translateY(-18px); opacity:0 }' +
    '}';
  document.head.appendChild(styleEl);

  const headline = document.createElement('div');
  headline.textContent = 'Last Torch';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const n = order.length;
  const colW = n > 8 ? 68 : 86;
  const stageW = Math.max(520, Math.min(720, n * colW + 48));
  const stageH = 320;

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#1a1008 0%,#2a1a10 46%,#3a2414 78%,#1a1008 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const stones = document.createElement('div');
  stones.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;height:86px;z-index:1;' +
    'background:repeating-linear-gradient(90deg,#4a3424 0 52px,#3a2818 52px 54px),' +
    'linear-gradient(180deg,#5a4030 0%,#2a1a10 100%);border-top:4px solid #1b110a;';
  stage.appendChild(stones);

  const layout = shuffle(order.map((_, i) => i));
  const winnerVisualIdx = layout.indexOf(targetIndex);

  const row = document.createElement('div');
  row.style.cssText =
    'position:absolute;left:12px;right:12px;bottom:28px;z-index:3;display:flex;' +
    'justify-content:space-evenly;align-items:flex-end;gap:4px;';
  stage.appendChild(row);

  const torchEls = [];
  layout.forEach((orderIdx) => {
    const person = order[orderIdx];
    const col = document.createElement('div');
    col.style.cssText =
      'display:flex;flex-direction:column;align-items:center;gap:6px;' +
      'transition:opacity 0.4s, filter 0.4s;';

    const flame = makeFlame(ns);
    const smoke = makeSmoke(ns);
    smoke.style.display = 'none';

    const stick = document.createElement('div');
    stick.style.cssText =
      'width:12px;height:70px;border-radius:3px;border:2px solid #1b110a;' +
      'background:linear-gradient(90deg,#c49a62,#6a3a14 45%,#3a200c);' +
      'box-shadow:inset 2px 0 0 rgba(255,255,255,0.18);';

    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'width:48px;height:48px;border-radius:50%;object-fit:cover;border:3px solid #1b110a;' +
      'box-shadow:0 3px 0 #1b110a;transition:border-color 0.3s, box-shadow 0.3s, filter 0.3s;';

    const name = document.createElement('span');
    name.textContent = String(person.name).split(' ')[0].slice(0, 9);
    name.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:10px;color:#fbf4dd;' +
      'text-shadow:0 1px 2px #000;white-space:nowrap;';

    col.appendChild(flame);
    col.appendChild(smoke);
    col.appendChild(stick);
    col.appendChild(img);
    col.appendChild(name);
    row.appendChild(col);
    torchEls.push({ col: col, flame: flame, smoke: smoke, img: img });
  });

  const caption = document.createElement('div');
  caption.textContent = 'Keep the flame';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:14px;text-align:center;z-index:4;' +
    'font-family:"Rye","Times New Roman",serif;font-size:14px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  document.body.appendChild(overlay);

  const snuffOrder = torchEls.map((_, i) => i).filter((i) => i !== winnerVisualIdx);
  for (let i = snuffOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = snuffOrder[i];
    snuffOrder[i] = snuffOrder[j];
    snuffOrder[j] = tmp;
  }

  const stepMs = (CONFIG.spinDuration - 900) / Math.max(1, snuffOrder.length);
  snuffOrder.forEach((idx, nIdx) => {
    setTimeout(() => {
      const t = torchEls[idx];
      t.flame.style.opacity = '0';
      t.flame.style.transform = 'scale(0.4) translateY(8px)';
      t.flame.style.animation = 'none';
      t.smoke.style.display = 'block';
      t.smoke.style.opacity = '1';
      t.smoke.querySelectorAll('ellipse').forEach((puff, i) => {
        puff.style.animation = ns + '_puff 0.7s ease-out ' + (i * 0.08) + 's forwards';
      });
      t.img.style.filter = 'grayscale(1) brightness(0.55)';
      t.col.style.opacity = '0.5';
      caption.textContent = 'Snuffed';
    }, 420 + nIdx * stepMs);
  });

  setTimeout(() => {
    const t = torchEls[winnerVisualIdx];
    t.flame.style.filter = 'drop-shadow(0 0 14px #ff9500) drop-shadow(0 0 28px #ff3b30)';
    t.flame.style.transform = 'scale(1.28) translateY(-6px)';
    t.img.style.borderColor = '#f6e27a';
    t.img.style.boxShadow = '0 3px 0 #1b110a, 0 0 22px rgba(255,149,0,0.85)';
    caption.textContent = 'The last light';
  }, CONFIG.spinDuration - 280);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 120);
}
