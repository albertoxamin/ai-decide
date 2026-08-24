import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'pinata';
export const label = 'Pi\u00f1ata';

const FRINGE = ['#e81dbb', '#ffcc00', '#0cc846', '#007aff', '#ff3b30', '#af52de'];

function starPinata() {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;left:50%;top:78px;width:120px;height:120px;margin-left:-60px;z-index:4;' +
    'transform-origin:50% -70px;';
  el.innerHTML =
    '<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="pinataFill" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#e81dbb"/>' +
          '<stop offset="35%" stop-color="#ffcc00"/>' +
          '<stop offset="65%" stop-color="#0cc846"/>' +
          '<stop offset="100%" stop-color="#007aff"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<polygon points="60,6 73,44 114,44 81,68 94,108 60,84 26,108 39,68 6,44 47,44" ' +
        'fill="url(#pinataFill)" stroke="#1b110a" stroke-width="4" stroke-linejoin="round"/>' +
      '<circle cx="60" cy="58" r="10" fill="#1b110a" opacity="0.18"/>' +
    '</svg>';
  for (let i = 0; i < 7; i++) {
    const tassel = document.createElement('div');
    tassel.style.cssText =
      'position:absolute;left:' + (18 + i * 12) + 'px;bottom:-16px;width:6px;height:22px;' +
      'background:' + FRINGE[i % FRINGE.length] + ';border:1px solid #1b110a;' +
      'border-radius:0 0 4px 4px;transform:rotate(' + (i - 3) * 6 + 'deg);';
    el.appendChild(tassel);
  }
  return el;
}

/** Fiesta piñata: sealed until the last swing. Candy flies, then the winner drops in the olla. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const n = order.length;
  const SWING_MS = 700;
  const swings = 3;
  const burstMs = 1100;
  const holdMs = 700;

  const headline = document.createElement('div');
  headline.textContent = 'Pi\u00f1ata';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 580;
  const stageH = 400;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#3a1058 0%,#c83a1e 42%,#f2a12e 78%,#5a2a10 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  // Papel picado
  for (let i = 0; i < 9; i++) {
    const flag = document.createElement('div');
    flag.style.cssText =
      'position:absolute;top:6px;left:' + (18 + i * 60) + 'px;width:46px;height:22px;' +
      'background:' + FRINGE[i % FRINGE.length] + ';' +
      'clip-path:polygon(0 0,100% 0,100% 70%,50% 100%,0 70%);border:2px solid #1b110a;';
    stage.appendChild(flag);
  }

  const caption = document.createElement('div');
  caption.textContent = 'Who is inside?';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:34px;text-align:center;z-index:9;' +
    'font-family:"Rye","Times New Roman",serif;font-size:15px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  const rope = document.createElement('div');
  rope.style.cssText =
    'position:absolute;left:50%;top:28px;width:4px;height:52px;margin-left:-2px;' +
    'background:linear-gradient(#fbf4dd,#d99a2b);border-left:1px solid #1b110a;z-index:3;';
  stage.appendChild(rope);

  const pinata = starPinata();
  stage.appendChild(pinata);

  const bat = document.createElement('div');
  bat.style.cssText =
    'position:absolute;left:28px;top:70px;width:190px;height:16px;z-index:7;' +
    'background:linear-gradient(90deg,#4a2810,#e8c97a 55%,#8a5a20);' +
    'border:3px solid #1b110a;border-radius:8px;transform-origin:10px 50%;' +
    'transform:rotate(-62deg);box-shadow:0 4px 0 #1b110a;';
  const grip = document.createElement('div');
  grip.style.cssText =
    'position:absolute;left:-8px;top:-8px;width:28px;height:32px;border-radius:6px;' +
    'background:#3a2414;border:2px solid #1b110a;';
  bat.appendChild(grip);
  stage.appendChild(bat);

  const olla = document.createElement('div');
  olla.style.cssText =
    'position:absolute;left:50%;bottom:16px;width:150px;height:52px;margin-left:-75px;z-index:3;' +
    'background:linear-gradient(180deg,#c45a28,#6a2410);border:3px solid #1b110a;' +
    'border-radius:8px 8px 40px 40px;box-shadow:inset 0 8px 0 rgba(0,0,0,0.2);';
  const ollaRim = document.createElement('div');
  ollaRim.style.cssText =
    'position:absolute;left:8px;right:8px;top:-6px;height:12px;border-radius:8px;' +
    'background:#e8a060;border:2px solid #1b110a;';
  olla.appendChild(ollaRim);
  stage.appendChild(olla);

  const shards = [];
  for (let i = 0; i < 8; i++) {
    const sh = document.createElement('div');
    sh.style.cssText =
      'position:absolute;left:50%;top:110px;width:18px;height:18px;margin-left:-9px;z-index:5;opacity:0;' +
      'background:' + FRINGE[i % FRINGE.length] + ';border:2px solid #1b110a;' +
      'clip-path:polygon(50% 0,100% 100%,0 100%);' +
      'transition:left 0.55s ease-out, top 0.55s ease-out, transform 0.55s ease-out, opacity 0.4s;';
    stage.appendChild(sh);
    shards.push(sh);
  }

  const confetti = [];
  for (let i = 0; i < 18; i++) {
    const c = document.createElement('div');
    c.style.cssText =
      'position:absolute;left:50%;top:110px;width:8px;height:12px;margin-left:-4px;z-index:5;opacity:0;' +
      'background:' + FRINGE[i % FRINGE.length] + ';border:1px solid #1b110a;' +
      'transition:left 0.8s cubic-bezier(0.2,0.7,0.3,1), top 0.8s cubic-bezier(0.45,0.05,0.7,1.1), opacity 0.5s, transform 0.8s;';
    stage.appendChild(c);
    confetti.push(c);
  }

  const flyOrder = order.map(function (_, i) { return i; });
  for (let i = flyOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = flyOrder[i];
    flyOrder[i] = flyOrder[j];
    flyOrder[j] = tmp;
  }

  const candies = flyOrder.map(function (idx) {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:absolute;left:50%;top:108px;width:40px;height:40px;margin-left:-20px;z-index:6;opacity:0;' +
      'transition:left 0.7s cubic-bezier(0.2,0.8,0.3,1), top 0.7s cubic-bezier(0.4,0.1,0.6,1.15),' +
      'opacity 0.25s, transform 0.5s, filter 0.4s;';
    const foil = document.createElement('div');
    foil.style.cssText =
      'position:absolute;inset:0;border-radius:8px;background:' + FRINGE[idx % FRINGE.length] + ';' +
      'border:2px solid #1b110a;transform:rotate(' + (idx % 2 ? 12 : -12) + 'deg);' +
      'transition:opacity 0.25s;';
    const img = document.createElement('img');
    img.src = order[idx].avatarUrl;
    img.alt = '';
    img.style.cssText =
      'position:absolute;inset:3px;width:34px;height:34px;border-radius:50%;object-fit:cover;' +
      'border:2px solid #fff;opacity:0;transition:opacity 0.3s;';
    wrap.appendChild(foil);
    wrap.appendChild(img);
    stage.appendChild(wrap);
    return { wrap: wrap, foil: foil, img: img, idx: idx };
  });

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes pinataSway { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(12deg); } }' +
    '@keyframes pinataHit { 0% { transform: rotate(8deg); } 40% { transform: rotate(-28deg) scale(1.05); } 100% { transform: rotate(6deg); } }' +
    '@keyframes batWhoosh { 0% { transform: rotate(-62deg); } 55% { transform: rotate(38deg); } 100% { transform: rotate(-50deg); } }' +
    '@keyframes batSmash { 0% { transform: rotate(-62deg); } 70% { transform: rotate(42deg); } 100% { transform: rotate(24deg); } }';
  document.head.appendChild(styleEl);
  pinata.style.animation = 'pinataSway 1.1s ease-in-out infinite';

  document.body.appendChild(overlay);

  const SWING_LINES = ['Miss!', 'Almost\u2026', 'CRACK!'];
  for (let s = 0; s < swings; s++) {
    setTimeout(function () {
      const last = s === swings - 1;
      bat.style.animation = 'none';
      void bat.offsetWidth;
      bat.style.animation = (last ? 'batSmash' : 'batWhoosh') + ' 0.55s ease-in';
      pinata.style.animation = 'none';
      void pinata.offsetWidth;
      pinata.style.animation = last ? 'none' : 'pinataHit 0.5s ease-out';
      caption.textContent = SWING_LINES[s];
    }, 280 + s * SWING_MS);
  }

  const burstAt = 280 + (swings - 1) * SWING_MS + 180;
  setTimeout(function () {
    pinata.style.transition = 'opacity 0.2s, transform 0.25s';
    pinata.style.opacity = '0';
    pinata.style.transform = 'scale(1.35) rotate(20deg)';
    shards.forEach(function (sh, i) {
      const ang = (i / shards.length) * Math.PI * 2;
      sh.style.opacity = '1';
      sh.style.left = 50 + Math.cos(ang) * 28 + '%';
      sh.style.top = 90 + Math.sin(ang) * 70 + 'px';
      sh.style.transform = 'rotate(' + (i * 40) + 'deg) scale(1.2)';
    });
    confetti.forEach(function (c, i) {
      c.style.opacity = '1';
      c.style.left = 20 + Math.random() * 60 + '%';
      c.style.top = 80 + Math.random() * 200 + 'px';
      c.style.transform = 'rotate(' + (Math.random() * 200 - 100) + 'deg)';
    });
    candies.forEach(function (c, i) {
      c.wrap.style.opacity = '1';
      const ang = (i / Math.max(n, 1)) * Math.PI * 2 + 0.4;
      c.wrap.style.left = 50 + Math.cos(ang) * 32 + '%';
      c.wrap.style.top = 150 + Math.sin(ang) * 48 + 'px';
      c.wrap.style.transform = 'rotate(' + (Math.random() * 50 - 25) + 'deg)';
    });
    caption.textContent = 'Dulces!';
  }, burstAt);

  setTimeout(function () {
    candies.forEach(function (c) {
      c.foil.style.opacity = '0';
      c.img.style.opacity = '1';
    });
    caption.textContent = 'Unwrapping\u2026';
  }, burstAt + 420);

  setTimeout(function () {
    shards.forEach(function (sh) { sh.style.opacity = '0'; });
    candies.forEach(function (c) {
      if (c.idx === targetIndex) {
        c.wrap.style.left = '50%';
        c.wrap.style.top = stageH - 78 + 'px';
        c.wrap.style.transform = 'scale(1.4) rotate(0deg)';
        c.wrap.style.zIndex = '9';
        c.wrap.style.filter = 'drop-shadow(0 0 12px rgba(255,232,150,0.95))';
      } else {
        c.wrap.style.top = stageH - 44 + 'px';
        c.wrap.style.left = 12 + Math.random() * 76 + '%';
        c.wrap.style.filter = 'grayscale(1)';
        c.wrap.style.opacity = '0.4';
        c.wrap.style.transform = 'scale(0.7) rotate(' + (Math.random() * 40 - 20) + 'deg)';
      }
    });
    caption.textContent = winner.name + '!';
  }, burstAt + 780);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, burstAt + burstMs + holdMs);
}
