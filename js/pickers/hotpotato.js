import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'hotpotato';
export const label = 'Hot potato';

function makePotato(size, fillId) {
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:' + size + 'px;height:' + Math.round(size * 0.78) + 'px;z-index:10;' +
    'transition:left 0.28s cubic-bezier(0.4,0,0.6,1), top 0.28s cubic-bezier(0.4,0,0.6,1),' +
    'transform 0.28s, filter 0.3s, opacity 0.4s;';

  wrap.innerHTML =
    '<svg viewBox="0 0 80 62" width="' + size + '" height="' + Math.round(size * 0.78) + '" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="' + fillId + '" cx="35%" cy="30%" r="70%">' +
          '<stop offset="0%" stop-color="#f0c48a"/>' +
          '<stop offset="45%" stop-color="#c47a2a"/>' +
          '<stop offset="100%" stop-color="#6a3a10"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<ellipse cx="40" cy="32" rx="34" ry="24" fill="url(#' + fillId + ')" stroke="#1b110a" stroke-width="3"/>' +
      '<ellipse cx="22" cy="24" rx="5" ry="3.5" fill="#5a3010" opacity="0.55"/>' +
      '<ellipse cx="52" cy="20" rx="4" ry="3" fill="#5a3010" opacity="0.5"/>' +
      '<ellipse cx="58" cy="36" rx="3.5" ry="2.5" fill="#5a3010" opacity="0.45"/>' +
      '<ellipse cx="28" cy="40" rx="3" ry="2.2" fill="#5a3010" opacity="0.4"/>' +
      '<circle cx="30" cy="28" r="3.2" fill="#1b110a"/>' +
      '<circle cx="48" cy="27" r="3.2" fill="#1b110a"/>' +
      '<circle cx="31" cy="27" r="1.1" fill="#fbf4dd"/>' +
      '<circle cx="49" cy="26" r="1.1" fill="#fbf4dd"/>' +
    '</svg>';
  return wrap;
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

/** Backyard hot potato: the spud hops the circle, heats up, then blows on the pick. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const potatoDuration = Math.max(CONFIG.spinDuration, 4500);
  const n = order.length;
  const uid = 'spud_' + Date.now();

  const headline = document.createElement('div');
  headline.textContent = 'Hot Potato';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:26px;letter-spacing:4px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 620;
  const stageH = 470;
  const cx = stageW / 2;
  const cy = stageH / 2 + 12;
  const avatarSize = n > 10 ? 42 : n > 6 ? 50 : 56;
  const potatoW = 58;
  const potatoH = Math.round(potatoW * 0.78);
  const radius = Math.min(stageW, stageH) / 2 - avatarSize - 48;

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + uid + '_heat {' +
      '0%,100% { opacity:0.35 } 50% { opacity:0.7 }' +
    '}' +
    '@keyframes ' + uid + '_steam {' +
      '0% { transform:translateY(0) scale(0.6); opacity:0 }' +
      '40% { opacity:0.7 }' +
      '100% { transform:translateY(-22px) scale(1.1); opacity:0 }' +
    '}';
  document.head.appendChild(styleEl);

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 50% 18%,#4a7a38 0%,#2a4a22 42%,#142010 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  for (let i = 0; i < 22; i++) {
    const tuft = document.createElement('div');
    tuft.style.cssText =
      'position:absolute;left:' + (12 + (i * 97) % (stageW - 28)) + 'px;top:' +
      (28 + ((i * 53) % (stageH - 40))) + 'px;width:10px;height:8px;z-index:1;' +
      'background:#3a6a28;clip-path:polygon(50% 0,100% 100%,0 100%);opacity:0.55;';
    stage.appendChild(tuft);
  }

  const caption = document.createElement('div');
  caption.textContent = 'Pass it!';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:10px;text-align:center;z-index:12;' +
    'font-family:"Rye","Times New Roman",serif;font-size:16px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  const dirt = document.createElement('div');
  dirt.style.cssText =
    'position:absolute;left:50%;top:50%;width:' + (radius * 2 + 36) + 'px;height:' + (radius * 2 + 20) + 'px;' +
    'margin-left:' + -(radius + 18) + 'px;margin-top:' + -(radius + 2) + 'px;border-radius:50%;' +
    'background:radial-gradient(ellipse at 50% 40%,#8a5a28 0%,#5a3818 58%,#3a2410 100%);' +
    'border:4px solid #1b110a;box-shadow:inset 0 8px 16px rgba(0,0,0,0.25);';
  stage.appendChild(dirt);

  const heat = document.createElement('div');
  heat.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0.2;' +
    'background:radial-gradient(circle at 50% 55%,rgba(255,80,0,0.55),transparent 58%);' +
    'animation:' + uid + '_heat 0.9s ease-in-out infinite;transition:opacity 0.4s;';
  stage.appendChild(heat);

  const layout = shuffle(order.map((_, i) => i));
  const winnerVisualIdx = layout.indexOf(targetIndex);

  const avatarPositions = [];
  layout.forEach((orderIdx, visualIdx) => {
    const person = order[orderIdx];
    const angle = (visualIdx / n) * Math.PI * 2 - Math.PI / 2;
    const ax = cx + radius * Math.cos(angle) - avatarSize / 2;
    const ay = cy + radius * Math.sin(angle) - avatarSize / 2;

    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:absolute;left:' + ax + 'px;top:' + ay + 'px;width:' + avatarSize + 'px;z-index:6;' +
      'display:flex;flex-direction:column;align-items:center;gap:4px;' +
      'transition:transform 0.25s, filter 0.5s;';

    const stump = document.createElement('div');
    stump.style.cssText =
      'position:absolute;left:50%;bottom:-6px;width:' + (avatarSize + 10) + 'px;height:14px;' +
      'margin-left:' + -(avatarSize + 10) / 2 + 'px;border-radius:50%;' +
      'background:#6a4018;border:2px solid #1b110a;z-index:0;';
    wrap.appendChild(stump);

    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'position:relative;z-index:1;width:' + avatarSize + 'px;height:' + avatarSize + 'px;border-radius:50%;' +
      'object-fit:cover;border:3px solid #fbf4dd;box-shadow:0 3px 0 #1b110a;' +
      'transition:border-color 0.25s, box-shadow 0.25s, transform 0.25s, filter 0.3s;';

    const name = document.createElement('span');
    name.textContent = person.name.split(' ')[0].slice(0, 9);
    name.style.cssText =
      'position:relative;z-index:1;font-family:"Rye","Times New Roman",serif;font-size:10px;' +
      'color:#fbf4dd;text-shadow:0 1px 0 #1b110a;letter-spacing:0.3px;';

    wrap.appendChild(img);
    wrap.appendChild(name);
    stage.appendChild(wrap);
    avatarPositions.push({
      wrap: wrap,
      img: img,
      x: ax + avatarSize / 2,
      y: ay + avatarSize / 2,
    });
  });

  const potato = makePotato(potatoW, uid + '_fill');
  potato.style.left = cx - potatoW / 2 + 'px';
  potato.style.top = cy - potatoH / 2 + 'px';
  potato.style.filter = 'drop-shadow(0 4px 0 #1b110a)';
  stage.appendChild(potato);

  const steam = [];
  for (let i = 0; i < 3; i++) {
    const puff = document.createElement('div');
    puff.style.cssText =
      'position:absolute;left:50%;top:-6px;width:10px;height:10px;margin-left:' + (i * 8 - 14) + 'px;' +
      'border-radius:50%;background:rgba(251,244,221,0.7);pointer-events:none;' +
      'animation:' + uid + '_steam 0.9s ease-out ' + (i * 0.22) + 's infinite;';
    potato.appendChild(puff);
    steam.push(puff);
  }

  document.body.appendChild(overlay);

  const totalMs = potatoDuration - 600;
  const hops = [];
  let t = 0;
  let cur = Math.floor(Math.random() * n);
  while (t < totalMs - 600) {
    const progress = t / totalMs;
    let speedFactor;
    if (progress < 0.5) {
      speedFactor = 1.4 - progress * 1.6;
    } else {
      speedFactor = 0.6 + (progress - 0.5) * 2.4;
    }
    const dt = 180 * speedFactor + Math.random() * 40;
    let next;
    if (Math.random() < 0.7) {
      const dir = Math.random() < 0.5 ? 1 : -1;
      next = (cur + dir + n) % n;
    } else {
      next = Math.floor(Math.random() * n);
      if (next === cur) next = (next + 1) % n;
    }
    hops.push({ at: t, idx: next });
    cur = next;
    t += dt;
  }
  let teaseIdx = Math.floor(Math.random() * n);
  if (teaseIdx === winnerVisualIdx) teaseIdx = (teaseIdx + 1) % n;
  hops.push({ at: totalMs - 350, idx: teaseIdx });
  hops.push({ at: totalMs, idx: winnerVisualIdx });

  let lastHighlighted = null;
  hops.forEach((hop, i) => {
    const isLast = i === hops.length - 1;
    const progress = hop.at / totalMs;
    setTimeout(() => {
      const target = avatarPositions[hop.idx];
      potato.style.left = target.x - potatoW / 2 + 'px';
      potato.style.top = target.y - avatarSize / 2 - potatoH - 4 + 'px';
      potato.style.transform =
        'rotate(' + (Math.random() - 0.5) * 46 + 'deg) scale(' + (isLast ? 1.35 : 1) + ')';
      heat.style.opacity = String(0.22 + progress * 0.55);
      potato.style.filter =
        'drop-shadow(0 4px 0 #1b110a) drop-shadow(0 0 ' + (8 + progress * 18) + 'px rgba(255,80,0,' +
        (0.35 + progress * 0.5) + '))';

      if (progress < 0.45) caption.textContent = 'Pass it!';
      else if (progress < 0.78) caption.textContent = "It's getting hot\u2026";
      else if (!isLast) caption.textContent = 'Almost\u2026';
      else caption.textContent = 'TOO HOT!';

      if (lastHighlighted !== null && lastHighlighted !== hop.idx) {
        const prev = avatarPositions[lastHighlighted];
        prev.img.style.borderColor = '#fbf4dd';
        prev.img.style.boxShadow = '0 3px 0 #1b110a';
        prev.img.style.transform = 'scale(1)';
      }
      const cur2 = avatarPositions[hop.idx];
      cur2.img.style.borderColor = isLast ? '#f6e27a' : '#c83a1e';
      cur2.img.style.boxShadow = isLast
        ? '0 3px 0 #1b110a, 0 0 22px rgba(246,226,122,0.9)'
        : '0 3px 0 #1b110a, 0 0 14px rgba(200,58,30,0.7)';
      cur2.img.style.transform = isLast ? 'scale(1.16)' : 'scale(1.06)';
      lastHighlighted = hop.idx;
    }, hop.at);
  });

  setTimeout(() => {
    caption.textContent = 'BOOM!';
    potato.style.transition = 'transform 0.35s cubic-bezier(0.2,1.4,0.4,1), opacity 0.35s, filter 0.3s';
    potato.style.transform = 'scale(2.2) rotate(18deg)';
    potato.style.filter = 'drop-shadow(0 0 24px #ff3b30) brightness(1.8)';

    const winnerPos = avatarPositions[winnerVisualIdx];
    const colors = ['#c83a1e', '#d99a2b', '#f6e27a', '#c47a2a', '#ff9500', '#6a3a10'];
    for (let i = 0; i < 16; i++) {
      const piece = document.createElement('div');
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 56 + Math.random() * 80;
      piece.style.cssText =
        'position:absolute;left:' + (winnerPos.x - 7) + 'px;top:' + (winnerPos.y - 7) + 'px;' +
        'width:' + (8 + (i % 3) * 4) + 'px;height:' + (7 + (i % 2) * 4) + 'px;z-index:11;' +
        'background:' + colors[i % colors.length] + ';border:2px solid #1b110a;border-radius:40% 60% 50% 40%;' +
        'transition:transform 0.65s cubic-bezier(0.2,0.7,0.4,1), opacity 0.65s;pointer-events:none;';
      stage.appendChild(piece);
      requestAnimationFrame(function () {
        piece.style.transform =
          'translate(' + Math.cos(angle) * dist + 'px,' + Math.sin(angle) * dist + 'px) rotate(' +
          Math.random() * 420 + 'deg)';
        piece.style.opacity = '0';
      });
    }

    setTimeout(() => {
      potato.style.opacity = '0';
    }, 180);

    avatarPositions.forEach(function (seat, i) {
      if (i !== winnerVisualIdx) {
        seat.wrap.style.filter = 'grayscale(1) brightness(0.45)';
      } else {
        seat.img.style.filter = 'sepia(0.35) contrast(1.1)';
      }
    });
  }, totalMs + 200);

  setTimeout(() => {
    styleEl.remove();
    overlay.remove();
    revealWinner(order, targetIndex);
  }, potatoDuration + 100);
}
