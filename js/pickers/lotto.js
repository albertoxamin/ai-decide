import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'lotto';
export const label = 'Lotto';

const BALL_COLORS = [
  '#c83a1e', '#d99a2b', '#2c5d52', '#007aff', '#5856d6',
  '#e81dbb', '#0cc846', '#ff9500', '#af52de', '#3d2a14',
];

export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const n = Math.max(1, order.length);
  const mixMs = Math.max(1100, Math.round(CONFIG.spinDuration * 0.58));
  const dropMs = 700;
  const holdMs = Math.max(450, CONFIG.spinDuration - mixMs - dropMs);

  const headline = document.createElement('div');
  headline.textContent = 'Live Draw';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 rgba(0,0,0,0.65);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 540;
  const stageH = 450;
  const hopperSize = 236;
  const ballSize = 44;
  const hopperLeft = (stageW - hopperSize) / 2;
  const hopperTop = 38;

  const uid = 'lotto_' + Date.now();
  const styleEl = document.createElement('style');
  let css =
    '@keyframes ' + uid + '_bulb { 0%,49% { opacity:1 } 50%,100% { opacity:0.28 } }' +
    '@keyframes ' + uid + '_glow { from { box-shadow:0 8px 18px rgba(0,0,0,0.5),inset 0 0 18px rgba(212,175,55,0.18) }' +
    ' to { box-shadow:0 8px 28px rgba(246,226,122,0.55),inset 0 0 22px rgba(246,226,122,0.35) } }';

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 50% 12%,#3a2060 0%,#140818 52%,#07040c 100%);' +
    'border:5px solid #d4af37;border-radius:12px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.7),inset 0 0 90px rgba(212,175,55,0.08);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Saturday night lottery';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:8px;text-align:center;z-index:8;' +
    'font-family:"Fraunces",Georgia,serif;font-size:13px;font-style:italic;color:#f6e27a;' +
    'text-shadow:0 1px 3px #000;letter-spacing:0.4px;';
  stage.appendChild(caption);

  for (let i = 0; i < 17; i++) {
    const bulb = document.createElement('div');
    bulb.style.cssText =
      'position:absolute;top:28px;left:' + (28 + i * 30) + 'px;width:9px;height:9px;border-radius:50%;' +
      'background:#f6e27a;box-shadow:0 0 7px #f6e27a;' +
      'animation:' + uid + '_bulb 0.8s steps(1,end) ' + (i % 2) * 0.4 + 's infinite;';
    stage.appendChild(bulb);
  }

  // Pedestal sits under the sphere so the red body never shows through the glass.
  const pedestal = document.createElement('div');
  pedestal.style.cssText =
    'position:absolute;left:155px;top:' + (hopperTop + hopperSize - 18) + 'px;' +
    'width:230px;height:92px;z-index:2;' +
    'background:linear-gradient(180deg,#9a1828 0%,#5c0c16 58%,#2a060c 100%);' +
    'border:4px solid #1b110a;border-radius:10px;' +
    'box-shadow:inset 0 10px 16px rgba(255,255,255,0.08),0 12px 22px rgba(0,0,0,0.45);';
  stage.appendChild(pedestal);

  const plaque = document.createElement('div');
  plaque.textContent = 'NATIONAL LOTTO';
  plaque.style.cssText =
    'position:absolute;left:50%;top:36px;transform:translateX(-50%);' +
    'font-family:"Rye","Times New Roman",serif;font-size:12px;letter-spacing:2px;color:#f6e27a;' +
    'text-shadow:0 1px 0 #1b110a;white-space:nowrap;';
  pedestal.appendChild(plaque);

  const neck = document.createElement('div');
  neck.style.cssText =
    'position:absolute;left:50%;top:-22px;transform:translateX(-50%);width:54px;height:28px;z-index:3;' +
    'background:linear-gradient(180deg,#eee6c4,#b8942a 55%,#6a4e12);' +
    'clip-path:polygon(22% 0,78% 0,100% 100%,0 100%);border-bottom:2px solid #1b110a;';
  pedestal.appendChild(neck);

  const hopper = document.createElement('div');
  hopper.style.cssText =
    'position:absolute;left:' + hopperLeft + 'px;top:' + hopperTop + 'px;' +
    'width:' + hopperSize + 'px;height:' + hopperSize + 'px;border-radius:50%;z-index:4;';
  stage.appendChild(hopper);

  const glass = document.createElement('div');
  glass.style.cssText =
    'position:absolute;inset:12px;border-radius:50%;overflow:hidden;' +
    'background:radial-gradient(circle at 30% 24%,rgba(255,255,255,0.38),rgba(80,140,200,0.16) 38%,rgba(8,16,36,0.72));' +
    'box-shadow:inset 0 -22px 30px rgba(0,0,0,0.4),inset 0 12px 18px rgba(255,255,255,0.2);';
  hopper.appendChild(glass);

  const mix = document.createElement('div');
  mix.style.cssText = 'position:absolute;inset:0;';
  glass.appendChild(mix);

  const orbits = [];
  order.forEach((person, i) => {
    const color = BALL_COLORS[i % BALL_COLORS.length];
    const orbitR = 32 + (i % 5) * 12;
    const dur = 0.95 + (i % 6) * 0.16;
    const delay = -(i * 0.19);
    const dir = i % 2 === 0 ? 1 : -1;
    const start = (i / n) * 360;
    const anim = uid + '_orbit_' + i;
    css +=
      '@keyframes ' + anim + ' {' +
      ' from { transform: rotate(' + start + 'deg); }' +
      ' to { transform: rotate(' + (start + dir * 360) + 'deg); } }';

    const orbit = document.createElement('div');
    orbit.style.cssText =
      'position:absolute;left:50%;top:50%;width:0;height:0;' +
      'animation:' + anim + ' ' + dur + 's linear ' + delay + 's infinite;';

    const ball = makeBall(person, color, ballSize);
    ball.style.top = -orbitR + 'px';
    ball.style.left = '0';
    ball.style.marginLeft = -ballSize / 2 + 'px';
    ball.style.marginTop = -ballSize / 2 + 'px';
    orbit.appendChild(ball);
    mix.appendChild(orbit);
    orbits.push({ orbit: orbit, color: color, person: person });
  });

  const cage = document.createElement('div');
  cage.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:5;';
  cage.innerHTML =
    '<svg viewBox="0 0 236 236" width="236" height="236" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="' + uid + '_rim" cx="34%" cy="28%">' +
          '<stop offset="0%" stop-color="#fff6d0"/>' +
          '<stop offset="42%" stop-color="#e0c04a"/>' +
          '<stop offset="100%" stop-color="#6a4a10"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<circle cx="118" cy="118" r="111" fill="none" stroke="url(#' + uid + '_rim)" stroke-width="13"/>' +
      '<circle cx="118" cy="118" r="102" fill="none" stroke="rgba(255,244,200,0.4)" stroke-width="2"/>' +
      '<g fill="none" stroke="rgba(232,196,80,0.62)" stroke-width="1.5">' +
        '<ellipse cx="118" cy="118" rx="92" ry="30"/>' +
        '<ellipse cx="118" cy="118" rx="92" ry="58"/>' +
        '<ellipse cx="118" cy="118" rx="30" ry="92"/>' +
        '<ellipse cx="118" cy="118" rx="58" ry="92"/>' +
      '</g>' +
      '<path d="M44 68 Q118 26 192 68" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="7" stroke-linecap="round"/>' +
    '</svg>';
  hopper.appendChild(cage);

  const tray = document.createElement('div');
  tray.style.cssText =
    'position:absolute;left:50%;bottom:16px;transform:translateX(-50%);' +
    'width:280px;height:78px;z-index:6;display:flex;align-items:center;justify-content:center;gap:12px;' +
    'background:linear-gradient(180deg,#2a1a08,#120c06);border:3px solid #d4af37;border-radius:14px;' +
    'box-shadow:0 8px 18px rgba(0,0,0,0.5),inset 0 0 18px rgba(212,175,55,0.18);' +
    'color:#f6e27a;font-family:"Fraunces",Georgia,serif;font-size:14px;font-style:italic;';
  tray.textContent = 'Waiting for the draw\u2026';
  stage.appendChild(tray);

  styleEl.textContent = css;
  document.head.appendChild(styleEl);
  document.body.appendChild(overlay);

  setTimeout(() => {
    orbits.forEach((o, i) => {
      o.orbit.style.animationPlayState = 'paused';
      o.orbit.style.transition = 'opacity 0.3s';
      o.orbit.style.opacity = i === targetIndex ? '0' : '0.22';
    });

    const flying = makeBall(winner, BALL_COLORS[targetIndex % BALL_COLORS.length], 52);
    flying.style.position = 'absolute';
    flying.style.left = stageW / 2 - 26 + 'px';
    flying.style.top = hopperTop + hopperSize - 40 + 'px';
    flying.style.zIndex = '9';
    flying.style.transition = 'top 0.55s cubic-bezier(0.4, 0.05, 0.6, 1.15), left 0.55s ease, transform 0.55s ease';
    stage.appendChild(flying);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flying.style.top = stageH - 78 + 'px';
        flying.style.transform = 'scale(1.08)';
      });
    });

    setTimeout(() => {
      flying.remove();
      tray.textContent = '';
      tray.style.fontStyle = 'normal';
      const img = document.createElement('img');
      img.src = winner.avatarUrl;
      img.alt = '';
      img.style.cssText =
        'width:48px;height:48px;border-radius:50%;object-fit:cover;' +
        'border:3px solid #f6e27a;box-shadow:0 0 12px rgba(246,226,122,0.55);';
      const name = document.createElement('span');
      name.textContent = winner.name;
      name.style.cssText =
        'font-family:"Rye","Times New Roman",serif;font-size:18px;letter-spacing:1px;color:#fbf4dd;';
      const tag = document.createElement('span');
      tag.textContent = 'WINNER';
      tag.style.cssText =
        'font-size:10px;letter-spacing:2px;color:#1b110a;background:#f6e27a;' +
        'padding:3px 8px;border-radius:4px;font-family:"Rye","Times New Roman",serif;';
      tray.appendChild(img);
      tray.appendChild(name);
      tray.appendChild(tag);
      tray.style.animation = uid + '_glow 0.4s ease-in-out 2 alternate';
    }, 560);
  }, mixMs);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, mixMs + dropMs + holdMs);
}

function makeBall(person, color, size) {
  const ball = document.createElement('div');
  ball.style.cssText =
    'position:absolute;width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
    'background:radial-gradient(circle at 32% 28%,#fff 0%,#fff 18%,' + color + ' 52%,' + shade(color) + ' 100%);' +
    'box-shadow:0 5px 10px rgba(0,0,0,0.45),inset -5px -6px 10px rgba(0,0,0,0.28),inset 3px 3px 6px rgba(255,255,255,0.5);' +
    'border:2px solid rgba(255,255,255,0.75);display:flex;align-items:center;justify-content:center;overflow:hidden;';
  const img = document.createElement('img');
  img.src = person.avatarUrl;
  img.alt = '';
  img.style.cssText =
    'width:' + (size - 16) + 'px;height:' + (size - 16) + 'px;border-radius:50%;object-fit:cover;' +
    'border:1px solid rgba(255,255,255,0.85);';
  ball.appendChild(img);
  return ball;
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - 40);
  const g = Math.max(0, ((n >> 8) & 255) - 40);
  const b = Math.max(0, (n & 255) - 40);
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

  /** Slot machine: 3 vertical reels of avatars roll past, all three lock onto the winner.
   *  Reels stop at staggered times for a satisfying "ka-chunk ka-chunk ka-chunk" feel. */
