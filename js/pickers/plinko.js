import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'plinko';
export const label = 'Plinko';

const SLOT_COLORS = [
  '#c83a1e', '#d99a2b', '#2c5d52', '#007aff', '#5856d6',
  '#e81dbb', '#0cc846', '#ff9500', '#af52de', '#3d2a14',
];

/** Price-is-Right plank: a chip drops through brass pegs into a shuffled prize pocket. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const n = Math.max(1, order.length);
  const uid = 'plinko_' + Date.now();

  const headline = document.createElement('div');
  headline.textContent = 'Plinko';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:28px;letter-spacing:6px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const w = 580;
  const h = 500;
  const rows = 9;
  const pegSize = 14;
  const binH = 112;
  const fieldInset = 20;
  const fieldW = w - fieldInset * 2;
  const fieldH = h - 56;
  const pegTop = 42;
  const pegBottom = fieldH - binH - 14;

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + uid + '_bulb { 0%,49% { opacity:1 } 50%,100% { opacity:0.32 } }' +
    '@keyframes ' + uid + '_chip { 0% { transform:rotate(0deg) } 100% { transform:rotate(360deg) } }';
  document.head.appendChild(styleEl);

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + w + 'px;height:' + h + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#6a3a14 0%,#3d1c0a 40%,#241008 100%);' +
    'border:6px solid #1b110a;border-radius:14px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.75), inset 0 0 0 5px #d4af37;';
  overlay.appendChild(stage);

  for (let i = 0; i < 19; i++) {
    const bulb = document.createElement('div');
    bulb.style.cssText =
      'position:absolute;top:10px;left:' + (18 + i * 29) + 'px;width:11px;height:11px;border-radius:50%;' +
      'background:#f6e27a;box-shadow:0 0 8px #f6e27a;border:1px solid #1b110a;z-index:8;' +
      'animation:' + uid + '_bulb 0.7s steps(1,end) ' + (i % 2) * 0.35 + 's infinite;';
    stage.appendChild(bulb);
  }

  const field = document.createElement('div');
  field.style.cssText =
    'position:absolute;left:' + fieldInset + 'px;right:' + fieldInset + 'px;top:32px;bottom:16px;' +
    'background:linear-gradient(180deg,#f6c445 0%,#e59a16 48%,#c45e10 100%);' +
    'border:4px solid #1b110a;border-radius:8px;overflow:hidden;' +
    'box-shadow:inset 0 12px 18px rgba(255,255,255,0.2), inset 0 -18px 22px rgba(80,20,0,0.28);';
  stage.appendChild(field);

  const leftRail = document.createElement('div');
  leftRail.style.cssText =
    'position:absolute;left:0;top:0;bottom:' + binH + 'px;width:10px;z-index:5;' +
    'background:linear-gradient(90deg,#8a4a12,#d4af37 45%,#6a3a10);border-right:3px solid #1b110a;';
  field.appendChild(leftRail);
  const rightRail = document.createElement('div');
  rightRail.style.cssText =
    'position:absolute;right:0;top:0;bottom:' + binH + 'px;width:10px;z-index:5;' +
    'background:linear-gradient(90deg,#6a3a10,#d4af37 55%,#8a4a12);border-left:3px solid #1b110a;';
  field.appendChild(rightRail);

  const chute = document.createElement('div');
  chute.style.cssText =
    'position:absolute;left:50%;top:0;width:52px;height:34px;margin-left:-26px;z-index:6;' +
    'background:linear-gradient(180deg,#f3e6b8,#c9a034 60%,#6a4e12);' +
    'border:3px solid #1b110a;border-top:none;border-radius:0 0 8px 8px;' +
    'box-shadow:inset 0 2px 0 rgba(255,255,255,0.45);';
  field.appendChild(chute);

  const pegRows = [];
  for (let r = 0; r < rows; r++) {
    const even = r % 2 === 0;
    const pegsInRow = even ? 9 : 8;
    const rowY = pegTop + (r / (rows - 1)) * (pegBottom - pegTop);
    const gutter = 18;
    const usable = fieldW - gutter * 2;
    const spacing = usable / 9;
    const startX = even ? gutter + spacing / 2 : gutter + spacing;
    const xs = [];
    for (let c = 0; c < pegsInRow; c++) {
      const x = startX + c * spacing;
      xs.push(x);
      const peg = document.createElement('div');
      peg.style.cssText =
        'position:absolute;left:' + (x - pegSize / 2) + 'px;top:' + rowY + 'px;' +
        'width:' + pegSize + 'px;height:' + pegSize + 'px;border-radius:50%;z-index:3;' +
        'background:radial-gradient(circle at 32% 28%,#fff8d6,#e8c85a 38%,#8a5a12 82%);' +
        'border:2px solid #1b110a;box-shadow:0 2px 0 #1b110a, 0 3px 4px rgba(0,0,0,0.35);';
      field.appendChild(peg);
    }
    pegRows.push({ y: rowY + pegSize, xs: xs });
  }

  const slotLayout = order.map((_, i) => i);
  for (let i = slotLayout.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [slotLayout[i], slotLayout[j]] = [slotLayout[j], slotLayout[i]];
  }
  const winnerVisualSlot = slotLayout.indexOf(targetIndex);

  const slotY = fieldH - binH;
  const slotW = fieldW / n;
  const avatarSize = Math.max(24, Math.min(42, Math.floor(slotW) - 14));

  const binBar = document.createElement('div');
  binBar.style.cssText =
    'position:absolute;left:0;right:0;top:' + slotY + 'px;height:' + binH + 'px;z-index:4;' +
    'background:linear-gradient(180deg,#3a1c0c,#1b110a);border-top:4px solid #1b110a;';
  field.appendChild(binBar);

  let winnerSlotEl = null;
  let winnerSlotImg = null;
  slotLayout.forEach((orderIdx, visualIdx) => {
    const p = order[orderIdx];
    const color = SLOT_COLORS[orderIdx % SLOT_COLORS.length];
    const slot = document.createElement('div');
    slot.style.cssText =
      'position:absolute;left:' + (visualIdx * slotW + 3) + 'px;top:8px;' +
      'width:' + (slotW - 6) + 'px;height:' + (binH - 16) + 'px;box-sizing:border-box;' +
      'background:linear-gradient(180deg,' + color + ' 0%,#1b110a 100%);' +
      'border:3px solid #d4af37;border-radius:6px;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:flex-end;' +
      'padding-bottom:8px;gap:4px;color:#fbf4dd;font-size:11px;text-align:center;' +
      'font-family:"Rye","Times New Roman",serif;letter-spacing:0.3px;' +
      'text-shadow:0 1px 0 #1b110a;overflow:hidden;' +
      'box-shadow:inset 0 8px 10px rgba(0,0,0,0.35);' +
      'transition:box-shadow 0.3s ease-out, filter 0.3s ease-out;';
    const img = document.createElement('img');
    img.src = p.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'width:' + avatarSize + 'px;height:' + avatarSize + 'px;border-radius:50%;object-fit:cover;' +
      'border:2px solid #fbf4dd;opacity:0.82;transition:opacity 0.3s ease-out, transform 0.3s;';
    const name = document.createElement('span');
    name.textContent = p.name.split(' ')[0].slice(0, 8);
    name.style.cssText = 'max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px;';
    slot.appendChild(img);
    slot.appendChild(name);
    binBar.appendChild(slot);
    if (orderIdx === targetIndex) {
      winnerSlotEl = slot;
      winnerSlotImg = img;
    }
  });

  const ballSize = 24;
  const startX = fieldW / 2;
  const startY = 6;
  const ball = document.createElement('div');
  ball.style.cssText =
    'position:absolute;left:' + (startX - ballSize / 2) + 'px;top:' + startY + 'px;' +
    'width:' + ballSize + 'px;height:' + ballSize + 'px;border-radius:50%;z-index:10;' +
    'background:radial-gradient(circle at 32% 28%,#fff3b0,#f2c23a 42%,#c83a1e 78%);' +
    'border:3px solid #1b110a;box-shadow:0 3px 0 #1b110a, 0 6px 10px rgba(0,0,0,0.35);' +
    'animation:' + uid + '_chip 0.55s linear infinite;';
  field.appendChild(ball);

  const targetX = (winnerVisualSlot + 0.5) * slotW;
  const waypoints = [];
  let curX = startX;
  pegRows.forEach((row, r) => {
    const remaining = pegRows.length - r;
    const drift = (targetX - curX) / remaining;
    const jitter = (Math.random() - 0.5) * 36;
    curX = Math.max(28, Math.min(fieldW - 28, curX + drift * 1.25 + jitter));
    let nearest = row.xs[0];
    let best = Math.abs(row.xs[0] - curX);
    for (let i = 1; i < row.xs.length; i++) {
      const d = Math.abs(row.xs[i] - curX);
      if (d < best) {
        best = d;
        nearest = row.xs[i];
      }
    }
    const bounce = nearest + (curX >= nearest ? 10 : -10);
    curX = Math.max(28, Math.min(fieldW - 28, bounce));
    waypoints.push({ x: curX, y: row.y });
  });
  waypoints.push({ x: targetX, y: slotY + 36 });

  document.body.appendChild(overlay);

  const stepMs = (CONFIG.spinDuration - 220) / waypoints.length;
  waypoints.forEach((wp, i) => {
    setTimeout(() => {
      ball.style.transition =
        'left ' + stepMs + 'ms cubic-bezier(0.45,0,0.55,1), top ' + stepMs + 'ms cubic-bezier(0.35,0.8,0.55,1)';
      ball.style.left = wp.x - ballSize / 2 + 'px';
      ball.style.top = wp.y - 4 + 'px';
    }, 80 + i * stepMs);
  });

  const landAt = 80 + waypoints.length * stepMs;
  setTimeout(() => {
    ball.style.animation = 'none';
    if (winnerSlotEl) {
      winnerSlotEl.style.boxShadow =
        'inset 0 -8px 18px rgba(246,226,122,0.55), 0 0 18px rgba(246,226,122,0.55)';
      winnerSlotEl.style.filter = 'brightness(1.2)';
    }
    if (winnerSlotImg) {
      winnerSlotImg.style.opacity = '1';
      winnerSlotImg.style.transform = 'scale(1.1)';
    }
  }, landAt);

  setTimeout(() => {
    styleEl.remove();
    overlay.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 120);
}
