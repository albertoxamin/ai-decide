import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'lightning';
export const label = 'Lightning';

function uid() {
  return 'ltn_' + Math.random().toString(36).slice(2, 9);
}

function jaggedBolt(x0, y0, x1, y1, segs, jag) {
  const pts = [[x0, y0]];
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const fade = 0.35 + 0.65 * (1 - Math.abs(t * 2 - 1));
    const wobble = (Math.random() * 2 - 1) * jag * fade;
    pts.push([x0 + dx * t + nx * wobble, y0 + dy * t + ny * wobble]);
  }
  pts.push([x1, y1]);
  return pts;
}

function toPath(pts) {
  return pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
}

function forkFrom(main, at, length, jag) {
  const i = Math.max(1, Math.min(main.length - 2, Math.round(main.length * at)));
  const [x0, y0] = main[i];
  const [px, py] = main[i - 1];
  const dx = x0 - px;
  const dy = y0 - py;
  const len = Math.hypot(dx, dy) || 1;
  const side = Math.random() < 0.5 ? 1 : -1;
  const ang = Math.atan2(dy, dx) + side * (0.5 + Math.random() * 0.7);
  const x1 = x0 + Math.cos(ang) * length;
  const y1 = y0 + Math.sin(ang) * length;
  return jaggedBolt(x0, y0, x1, y1, 4, jag * 0.55);
}

function makeBoltSvg(stageW, stageH, x0, y0, x1, y1, filterId, strong) {
  const main = jaggedBolt(x0, y0, x1, y1, strong ? 11 : 7, strong ? 22 : 14);
  const forks = [];
  const forkCount = strong ? 3 : 1;
  for (let i = 0; i < forkCount; i++) {
    forks.push(forkFrom(main, 0.25 + i * 0.22, 28 + Math.random() * 42, 12));
  }
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 ' + stageW + ' ' + stageH);
  svg.setAttribute('width', String(stageW));
  svg.setAttribute('height', String(stageH));
  svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:8;overflow:visible;';
  const glowW = strong ? 14 : 8;
  const coreW = strong ? 3.2 : 2;
  const dMain = toPath(main);
  const forkD = forks.map(toPath).join(' ');
  svg.innerHTML =
    '<defs>' +
      '<filter id="' + filterId + '" x="-40%" y="-40%" width="180%" height="180%">' +
        '<feGaussianBlur stdDeviation="' + (strong ? 4.5 : 2.4) + '" result="b"/>' +
        '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>' +
      '</filter>' +
    '</defs>' +
    '<path d="' + dMain + '" fill="none" stroke="#7ec8ff" stroke-width="' + glowW +
      '" stroke-linecap="round" stroke-linejoin="round" opacity="0.55" filter="url(#' + filterId + ')"/>' +
    '<path d="' + forkD + '" fill="none" stroke="#9ad4ff" stroke-width="' + (glowW * 0.45) +
      '" stroke-linecap="round" opacity="0.7" filter="url(#' + filterId + ')"/>' +
    '<path d="' + dMain + '" fill="none" stroke="#fffce8" stroke-width="' + coreW +
      '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="' + forkD + '" fill="none" stroke="#ffffff" stroke-width="' + (coreW * 0.7) +
      '" stroke-linecap="round"/>';
  return svg;
}

function cloudEl(left, top, scale, flip) {
  const w = Math.round(168 * scale);
  const h = Math.round(78 * scale);
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;' +
    'z-index:4;transform:' + (flip ? 'scaleX(-1)' : 'none') + ';';
  el.innerHTML =
    '<svg viewBox="0 0 168 78" width="' + w + '" height="' + h + '" aria-hidden="true">' +
      '<g fill="#2c3348" stroke="#1b110a" stroke-width="3">' +
        '<ellipse cx="42" cy="48" rx="34" ry="22"/>' +
        '<ellipse cx="84" cy="36" rx="42" ry="28"/>' +
        '<ellipse cx="128" cy="50" rx="32" ry="20"/>' +
      '</g>' +
      '<ellipse cx="78" cy="30" rx="22" ry="10" fill="#4a536c" opacity="0.45"/>' +
    '</svg>';
  return el;
}

/** Storm night: rumble flashes, then a branching bolt zaps the winner. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #12182c 0%, #05060c 72%)';

  const ns = uid();
  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + ns + '_rain {' +
      'from { background-position: 0 0, 12px 0; }' +
      'to { background-position: 18px 42px, 30px 56px; }' +
    '}' +
    '@keyframes ' + ns + '_drift {' +
      '0%,100% { transform: translateX(0); }' +
      '50% { transform: translateX(10px); }' +
    '}' +
    '@keyframes ' + ns + '_shake {' +
      '0%,100% { transform: translate(0,0); }' +
      '20% { transform: translate(-7px,3px); }' +
      '40% { transform: translate(8px,-2px); }' +
      '60% { transform: translate(-5px,-3px); }' +
      '80% { transform: translate(4px,2px); }' +
    '}';
  document.head.appendChild(styleEl);

  const headline = document.createElement('div');
  headline.textContent = 'Lightning';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 620;
  const stageH = 400;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#0b1020 0%,#1a1638 38%,#2a2048 68%,#1a1428 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  for (let i = 0; i < 18; i++) {
    const star = document.createElement('div');
    star.style.cssText =
      'position:absolute;left:' + Math.round(Math.random() * stageW) + 'px;top:' +
      Math.round(8 + Math.random() * 150) + 'px;width:2px;height:2px;border-radius:50%;' +
      'background:#fbf4dd;opacity:' + (0.25 + Math.random() * 0.55) + ';z-index:1;';
    stage.appendChild(star);
  }

  const rain = document.createElement('div');
  rain.style.cssText =
    'position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0.55;' +
    'background-image:repeating-linear-gradient(112deg,transparent 0 16px,rgba(190,215,255,0.22) 16px 17px),' +
    'repeating-linear-gradient(118deg,transparent 0 22px,rgba(190,215,255,0.12) 22px 23px);' +
    'animation:' + ns + '_rain 0.28s linear infinite;';
  stage.appendChild(rain);

  const cloudRow = document.createElement('div');
  cloudRow.style.cssText =
    'position:absolute;left:0;right:0;top:0;height:110px;z-index:4;' +
    'animation:' + ns + '_drift 4.2s ease-in-out infinite;';
  cloudRow.appendChild(cloudEl(-18, 8, 1.05, false));
  cloudRow.appendChild(cloudEl(210, -6, 1.2, true));
  cloudRow.appendChild(cloudEl(430, 12, 1.08, false));
  stage.appendChild(cloudRow);

  const hill = document.createElement('div');
  hill.style.cssText =
    'position:absolute;left:-8%;right:-8%;bottom:-28px;height:118px;z-index:3;' +
    'background:radial-gradient(ellipse at 50% 0%, #2c5d52 0%, #1a332c 55%, #0e1a16 100%);' +
    'border-top:4px solid #1b110a;border-radius:50% 50% 0 0;';
  stage.appendChild(hill);

  const layout = order.map((_, i) => i);
  for (let i = layout.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [layout[i], layout[j]] = [layout[j], layout[i]];
  }
  const winnerVisualIdx = layout.indexOf(targetIndex);

  const peopleRow = document.createElement('div');
  peopleRow.style.cssText =
    'position:absolute;left:18px;right:18px;bottom:22px;z-index:5;display:flex;' +
    'justify-content:space-evenly;align-items:flex-end;gap:6px;';
  stage.appendChild(peopleRow);

  const avatarEls = [];
  layout.forEach((orderIdx) => {
    const person = order[orderIdx];
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'display:flex;flex-direction:column;align-items:center;gap:4px;flex:0 1 auto;' +
      'transition:opacity 0.35s, filter 0.35s, transform 0.35s;';
    const body = document.createElement('div');
    body.style.cssText =
      'width:18px;height:16px;margin-top:-4px;background:#243040;border:2px solid #1b110a;' +
      'border-radius:4px 4px 6px 6px;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'width:46px;height:46px;border-radius:50%;object-fit:cover;border:3px solid #1b110a;' +
      'box-shadow:0 3px 0 #1b110a;transition:box-shadow 0.25s,border-color 0.25s,filter 0.25s;';
    const name = document.createElement('span');
    name.textContent = String(person.name).split(' ')[0].slice(0, 9);
    name.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:9px;color:#fbf4dd;' +
      'text-shadow:0 1px 2px #000;white-space:nowrap;';
    wrap.appendChild(img);
    wrap.appendChild(body);
    wrap.appendChild(name);
    peopleRow.appendChild(wrap);
    avatarEls.push({ wrap, img });
  });

  const caption = document.createElement('div');
  caption.textContent = 'Stand still.';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:86px;text-align:center;z-index:7;' +
    'font-family:"Rye","Times New Roman",serif;font-size:14px;letter-spacing:1px;color:#c9d4ee;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  const skyFlash = (color, ms) => {
    const prev = stage.style.background;
    stage.style.background = 'linear-gradient(180deg,' + color + ' 0%,#2a2048 55%,#1a1428 100%)';
    setTimeout(() => { stage.style.background = prev; }, ms);
  };

  const strike = (fromX, fromY, toX, toY, strong, hold) => {
    const bolt = makeBoltSvg(stageW, stageH, fromX, fromY, toX, toY, uid(), strong);
    stage.appendChild(bolt);
    setTimeout(() => bolt.remove(), hold);
    return bolt;
  };

  const cloudOrigins = [
    [70, 52],
    [310, 38],
    [520, 56],
  ];

  const total = CONFIG.spinDuration;
  const rumbleAt = [Math.round(total * 0.18), Math.round(total * 0.36), Math.round(total * 0.52)];
  rumbleAt.forEach((t, i) => {
    setTimeout(() => {
      const origin = cloudOrigins[i % cloudOrigins.length];
      const landX = 70 + Math.random() * (stageW - 140);
      strike(origin[0], origin[1], landX, 210 + Math.random() * 40, false, 90);
      skyFlash(i % 2 ? '#3a4a78' : '#4a5a92', 80);
    }, t);
  });

  const zapAt = Math.max(900, total - 850);
  setTimeout(() => {
    const winnerEl = avatarEls[winnerVisualIdx];
    const wRect = winnerEl.wrap.getBoundingClientRect();
    const sRect = stage.getBoundingClientRect();
    const toX = wRect.left - sRect.left + wRect.width / 2;
    const toY = wRect.top - sRect.top + 8;
    const nearest = cloudOrigins.reduce((best, p) =>
      Math.abs(p[0] - toX) < Math.abs(best[0] - toX) ? p : best
    );
    caption.textContent = 'ZAP';
    caption.style.color = '#fff8c8';
    skyFlash('#eef4ff', 70);
    strike(nearest[0], nearest[1], toX, toY, true, 720);
    setTimeout(() => skyFlash('#c8dcff', 60), 90);
    stage.style.animation = ns + '_shake 0.32s ease-out';

    avatarEls.forEach(({ wrap, img }, i) => {
      if (i === winnerVisualIdx) {
        img.style.borderColor = '#fff36a';
        img.style.boxShadow = '0 0 18px #fff36a, 0 0 42px #4aa3ff, 0 3px 0 #1b110a';
        wrap.style.transform = 'scale(1.16) translateY(-6px)';
      } else {
        wrap.style.opacity = '0.28';
        wrap.style.filter = 'grayscale(0.6)';
      }
    });
  }, zapAt);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, total + 120);
}
