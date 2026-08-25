import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'sortinghat';
export const label = 'Sorting hat';

function hatSvg(uid) {
  const leather = uid + '_leather';
  const brimTop = uid + '_brimTop';
  const brimSide = uid + '_brimSide';
  return (
    '<svg viewBox="0 0 280 300" width="100%" height="100%" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + leather + '" x1="20%" y1="0%" x2="85%" y2="100%">' +
          '<stop offset="0%" stop-color="#d2b07a"/>' +
          '<stop offset="35%" stop-color="#9a6a3a"/>' +
          '<stop offset="100%" stop-color="#3a2210"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + brimTop + '" x1="50%" y1="0%" x2="50%" y2="100%">' +
          '<stop offset="0%" stop-color="#c49a62"/>' +
          '<stop offset="100%" stop-color="#6a4424"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + brimSide + '" x1="50%" y1="0%" x2="50%" y2="100%">' +
          '<stop offset="0%" stop-color="#6a4424"/>' +
          '<stop offset="100%" stop-color="#1a1008"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<ellipse cx="132" cy="278" rx="96" ry="10" fill="#000" opacity="0.4"/>' +
      '<ellipse cx="132" cy="228" rx="118" ry="32" fill="url(#' + brimSide + ')" stroke="#100804" stroke-width="3.5"/>' +
      '<ellipse cx="132" cy="216" rx="118" ry="28" fill="url(#' + brimTop + ')" stroke="#100804" stroke-width="3.5"/>' +
      '<ellipse cx="128" cy="214" rx="46" ry="11" fill="#2a180c" stroke="#100804" stroke-width="2"/>' +
      '<path d="M28 216 C40 200 52 224 36 226 Z" fill="#3a2410" stroke="#100804" stroke-width="1.6"/>' +
      '<path d="M228 214 C246 200 258 226 236 226 Z" fill="#3a2410" stroke="#100804" stroke-width="1.6"/>' +
      '<path d="M90 214 C78 176 70 140 78 108 C86 78 72 52 94 30 C110 14 132 24 138 50 ' +
        'C144 72 136 90 150 104 C170 122 206 118 232 128 C250 136 256 154 246 170 ' +
        'C234 188 206 186 186 178 C170 170 168 190 160 208 C150 218 124 218 90 214 Z" ' +
        'fill="url(#' + leather + ')" stroke="#100804" stroke-width="3.5" stroke-linejoin="round"/>' +
      '<path d="M104 208 C96 160 92 118 106 84 C116 60 108 40 120 28" fill="none" stroke="#ead2a8" stroke-width="5.5" opacity="0.32" stroke-linecap="round"/>' +
      '<path d="M148 206 C164 168 192 150 214 140 C232 132 244 148 242 162" fill="none" stroke="#100804" stroke-width="2.8" opacity="0.35" stroke-linecap="round"/>' +
      '<path d="M198 136 C208 126 224 134 218 148 C210 156 190 148 198 136 Z" fill="#4a2c14" stroke="#100804" stroke-width="1.6"/>' +
      '<path d="M202 140 L210 150 M212 142 L218 152" fill="none" stroke="#e0c090" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M108 56 C116 46 132 52 128 64 C120 72 102 64 108 56 Z" fill="#5a3818" stroke="#100804" stroke-width="1.5"/>' +
      '<path d="M112 60 L118 70 M120 62 L124 72" fill="none" stroke="#e0c090" stroke-width="1.3" stroke-linecap="round"/>' +
      '<path d="M104 128 C112 116 128 118 132 132 C124 140 108 140 104 128 Z" fill="#100804"/>' +
      '<path d="M152 130 C160 118 176 120 180 134 C172 142 156 142 152 130 Z" fill="#100804"/>' +
      '<path d="M102 120 Q120 110 134 124" fill="none" stroke="#100804" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M150 122 Q168 110 184 126" fill="none" stroke="#100804" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M138 140 Q144 150 142 160" fill="none" stroke="#100804" stroke-width="2.3" stroke-linecap="round"/>' +
      '<path class="hat-mouth-closed" d="M112 168 C128 180 152 182 170 170 C154 178 132 178 112 168 Z" fill="#100804"/>' +
      '<path class="hat-mouth-open" d="M110 164 C132 158 158 160 174 170 C164 196 128 202 114 178 C108 172 106 168 110 164 Z" fill="#1a0a08" stroke="#100804" stroke-width="1.7" opacity="0"/>' +
    '</svg>'
  );
}

export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const uid = 'sh' + Date.now();

  const avatarSize = 64;
  const gap = 16;
  const totalW = order.length * (avatarSize + gap) - gap;
  const hatW = 168;
  const hatH = 180;
  const stageW = Math.max(totalW + 90, 560);
  const stageH = 380;
  const avatarY = 258;
  const startX = (stageW - totalW) / 2;
  const hoverTop = 18;
  const landTop = avatarY - 108;

  const hopName = uid + '_hop';
  const talkName = uid + '_talk';
  const glowName = uid + '_glow';
  const styleEl = document.createElement('style');
  styleEl.textContent =
    `@keyframes ${hopName} {` +
      '0% { transform: translateY(0) rotate(0deg) scale(1,1); }' +
      '35% { transform: translateY(-18px) rotate(-8deg) scale(0.94,1.08); }' +
      '70% { transform: translateY(4px) rotate(6deg) scale(1.06,0.92); }' +
      '100% { transform: translateY(0) rotate(0deg) scale(1,1); }' +
    '}' +
    `@keyframes ${talkName} {` +
      '0%,100% { transform: scaleY(1); }' +
      '40% { transform: scaleY(1.18); }' +
      '70% { transform: scaleY(0.92); }' +
    '}' +
    `@keyframes ${glowName} {` +
      '0%,100% { filter: drop-shadow(0 0 8px rgba(217,154,43,0.45)); }' +
      '50% { filter: drop-shadow(0 0 22px rgba(217,154,43,0.95)); }' +
    '}';
  document.head.appendChild(styleEl);

  const stage = document.createElement('div');
  stage.style.cssText =
    `position:relative;width:${stageW}px;height:${stageH}px;` +
    'background:radial-gradient(ellipse at 50% 0%,#4a2e14 0%,#1c120c 42%,#0a0604 100%);' +
    'border-radius:18px;border:3px solid #c9a227;' +
    'box-shadow:0 0 40px rgba(201,162,39,0.28), inset 0 0 80px rgba(0,0,0,0.6);' +
    'overflow:hidden;';

  const banner = document.createElement('div');
  banner.textContent = 'the sorting hat';
  banner.style.cssText =
    'position:absolute;left:50%;top:10px;transform:translateX(-50%);' +
    'font-family:Rye,Georgia,serif;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;' +
    'color:#d99a2b;text-shadow:0 0 10px rgba(217,154,43,0.5);pointer-events:none;';
  stage.appendChild(banner);

  for (let i = 0; i < 7; i++) {
    const candle = document.createElement('div');
    const cx = 10 + (i / 6) * 80;
    candle.style.cssText =
      `position:absolute;left:${cx}%;top:${18 + (i % 3) * 10}px;width:3px;height:14px;` +
      'background:#f4e0a8;border-radius:1px;opacity:0.55;pointer-events:none;' +
      `box-shadow:0 0 10px 3px rgba(255,200,80,0.45);transform:translateX(-50%);`;
    stage.appendChild(candle);
  }

  // floor
  const floor = document.createElement('div');
  floor.style.cssText =
    `position:absolute;left:8%;right:8%;top:${avatarY + avatarSize + 18}px;height:18px;` +
    'background:linear-gradient(180deg,#4a3424,#1a100c);border-radius:40%;opacity:0.85;' +
    'box-shadow:0 8px 18px rgba(0,0,0,0.5);';
  stage.appendChild(floor);

  const layout = order.map((_, i) => i);
  for (let i = layout.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [layout[i], layout[j]] = [layout[j], layout[i]];
  }
  const winnerVisualIdx = layout.indexOf(targetIndex);

  const avatarEls = [];
  layout.forEach((orderIdx) => {
    const person = order[orderIdx];
    const wrap = document.createElement('div');
    const x = startX + avatarEls.length * (avatarSize + gap);
    wrap.style.cssText =
      `position:absolute;left:${x}px;top:${avatarY}px;width:${avatarSize}px;` +
      'display:flex;flex-direction:column;align-items:center;gap:6px;' +
      'color:#fbf4dd;font-size:11px;font-weight:600;transition:filter 0.35s, transform 0.35s;' +
      'font-family:Fraunces,Georgia,serif;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.style.cssText =
      `width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;object-fit:cover;` +
      'border:2.5px solid #b89e6f;transition:border 0.3s, box-shadow 0.3s;' +
      'box-shadow:0 4px 0 #1b110a;';
    const name = document.createElement('span');
    name.textContent = person.name.split(' ')[0].slice(0, 10);
    wrap.appendChild(img);
    wrap.appendChild(name);
    stage.appendChild(wrap);
    avatarEls.push({ wrap, img, x });
  });

  const hat = document.createElement('div');
  hat.innerHTML = hatSvg(uid);
  hat.style.cssText =
    `position:absolute;left:0;top:${hoverTop}px;width:${hatW}px;height:${hatH}px;z-index:10;` +
    'transform-origin:50% 80%;pointer-events:none;' +
    'filter:drop-shadow(4px 8px 6px rgba(0,0,0,0.55));' +
    'transition:left 0.38s cubic-bezier(0.45, 0.05, 0.25, 1), top 0.38s cubic-bezier(0.45, 0.05, 0.25, 1);';
  stage.appendChild(hat);

  const closedMouth = hat.querySelector('.hat-mouth-closed');
  const openMouth = hat.querySelector('.hat-mouth-open');

  function setTalking(open) {
    if (closedMouth) closedMouth.style.opacity = open ? '0' : '1';
    if (openMouth) openMouth.style.opacity = open ? '1' : '0';
  }

  const bubble = document.createElement('div');
  bubble.style.cssText =
    'position:absolute;background:#fbf4dd;color:#1b110a;padding:8px 16px;border-radius:4px 14px 14px 14px;' +
    'font-size:14px;font-weight:700;border:2px solid #1b110a;box-shadow:3px 3px 0 #1b110a;' +
    'opacity:0;transition:opacity 0.18s,left 0.38s,top 0.38s,background 0.2s;z-index:12;' +
    'font-family:Fraunces,Georgia,serif;white-space:nowrap;pointer-events:none;';
  stage.appendChild(bubble);

  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  const mumbles = [
    'Hmm...',
    'Difficult...',
    'A sharp mind...',
    'Where to put you?',
    'Not sure...',
    'Could be...',
    'Ah, I know...',
  ];
  const hopCount = Math.min(order.length + 2, 8);
  const hops = [];
  for (let h = 0; h < hopCount - 1; h++) {
    hops.push(Math.floor(Math.random() * order.length));
  }
  hops.push(winnerVisualIdx);

  const hopMs = (CONFIG.spinDuration - 220) / hops.length;

  function hatLeft(ax) {
    return ax + avatarSize / 2 - hatW / 2;
  }

  hat.style.left = `${hatLeft(avatarEls[hops[0]].x)}px`;

  hops.forEach((avatarIdx, h) => {
    const isLast = h === hops.length - 1;
    setTimeout(() => {
      const ax = avatarEls[avatarIdx].x;
      hat.style.left = `${hatLeft(ax)}px`;
      hat.style.top = `${isLast ? landTop : hoverTop}px`;
      hat.style.animation = 'none';
      void hat.offsetWidth;
      hat.style.animation = `${hopName} ${Math.min(hopMs * 0.9, 420)}ms cubic-bezier(0.4, 0, 0.3, 1)`;

      setTalking(true);
      setTimeout(() => { if (!isLast) setTalking(false); }, 220);

      bubble.textContent = isLast ? 'Better be… STANDUP!' : mumbles[Math.floor(Math.random() * mumbles.length)];
      bubble.style.left = `${ax + avatarSize / 2 + 18}px`;
      bubble.style.top = `${isLast ? landTop + 8 : 8}px`;
      bubble.style.opacity = '1';

      if (isLast) {
        bubble.style.background = '#d99a2b';
        bubble.style.color = '#1b110a';
        bubble.style.fontSize = '17px';
        hat.style.filter = 'drop-shadow(0 0 16px rgba(217,154,43,0.85))';
        hat.style.animation = `${glowName} 0.7s ease-in-out infinite`;
        avatarEls[avatarIdx].img.style.boxShadow = '0 0 28px rgba(217,154,43,0.85), 0 4px 0 #1b110a';
        avatarEls[avatarIdx].img.style.border = '3px solid #d99a2b';
        avatarEls[avatarIdx].wrap.style.transform = 'translateY(-6px)';
        avatarEls.forEach(({ wrap }, i) => {
          if (i !== avatarIdx) wrap.style.filter = 'grayscale(1) opacity(0.35)';
        });
      }
    }, h * hopMs);
  });

  setTimeout(() => {
    styleEl.remove();
    overlay.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 100);
}
