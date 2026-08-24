import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'amongus';
export const label = 'Among Us eject';

const SUITS = [
  '#c51111', '#132ed1', '#117f2d', '#ed54ba',
  '#ef7d0d', '#f6f657', '#3f474e', '#d6e0f0',
  '#6b2fbb', '#71491e', '#38fedc', '#50ef39',
];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 255) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/** Side-view crewmate: backpack, bean body, visor with avatar, stubby legs. */
function makeCrewmate(person, i, scale) {
  const color = SUITS[i % SUITS.length];
  const dark = shade(color, -40);
  const s = scale || 1;
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:' + Math.round(72 * s) + 'px;height:' + Math.round(92 * s) + 'px;z-index:6;' +
    'transform-origin:50% 80%;transition:left 0.9s cubic-bezier(0.4,0,0.6,1), top 0.9s cubic-bezier(0.4,0,0.6,1),' +
    'transform 0.9s cubic-bezier(0.4,0,0.6,1), opacity 0.4s, filter 0.4s;';

  wrap.innerHTML =
    '<div style="position:absolute;left:0;top:' + Math.round(22 * s) + 'px;width:' + Math.round(18 * s) + 'px;' +
    'height:' + Math.round(38 * s) + 'px;background:' + dark + ';border:3px solid #1b110a;border-radius:10px 4px 8px 10px;"></div>' +
    '<div style="position:absolute;left:' + Math.round(10 * s) + 'px;top:' + Math.round(8 * s) + 'px;width:' + Math.round(48 * s) + 'px;' +
    'height:' + Math.round(58 * s) + 'px;background:linear-gradient(180deg,' + color + ' 0%,' + dark + ' 100%);' +
    'border:3px solid #1b110a;border-radius:48% 48% 40% 40%;box-shadow:inset 6px 4px 0 rgba(255,255,255,0.18);"></div>' +
    '<div style="position:absolute;left:' + Math.round(20 * s) + 'px;bottom:0;width:' + Math.round(14 * s) + 'px;' +
    'height:' + Math.round(20 * s) + 'px;background:' + color + ';border:3px solid #1b110a;border-radius:6px 6px 8px 8px;"></div>' +
    '<div style="position:absolute;left:' + Math.round(38 * s) + 'px;bottom:0;width:' + Math.round(14 * s) + 'px;' +
    'height:' + Math.round(20 * s) + 'px;background:' + color + ';border:3px solid #1b110a;border-radius:6px 6px 8px 8px;"></div>';

  const visor = document.createElement('div');
  visor.style.cssText =
    'position:absolute;left:' + Math.round(28 * s) + 'px;top:' + Math.round(20 * s) + 'px;width:' + Math.round(30 * s) + 'px;' +
    'height:' + Math.round(22 * s) + 'px;border-radius:12px;overflow:hidden;z-index:2;' +
    'border:3px solid #1b110a;background:linear-gradient(180deg,#d4f2ff,#5aa0c8);' +
    'box-shadow:inset 0 2px 0 rgba(255,255,255,0.55);';
  const face = document.createElement('img');
  face.src = person.avatarUrl;
  face.style.cssText =
    'width:100%;height:100%;object-fit:cover;opacity:0.92;';
  visor.appendChild(face);
  wrap.appendChild(visor);

  const tag = document.createElement('div');
  tag.textContent = String(person.name).slice(0, 9);
  tag.style.cssText =
    'position:absolute;left:50%;bottom:-16px;transform:translateX(-50%);' +
    'font-family:"Rye","Times New Roman",serif;font-size:' + Math.max(8, Math.round(10 * s)) + 'px;' +
    'color:#fbf4dd;text-shadow:0 1px 2px #000;white-space:nowrap;';
  wrap.appendChild(tag);
  return wrap;
}

function miniBean(color, size) {
  const el = document.createElement('div');
  el.style.cssText =
    'width:' + size + 'px;height:' + Math.round(size * 1.15) + 'px;position:relative;flex-shrink:0;';
  el.innerHTML =
    '<div style="position:absolute;left:0;top:28%;width:28%;height:48%;background:' + shade(color, -40) +
    ';border:2px solid #1b110a;border-radius:6px 2px 4px 6px;"></div>' +
    '<div style="position:absolute;left:18%;top:8%;width:70%;height:70%;background:' + color +
    ';border:2px solid #1b110a;border-radius:45%;"></div>' +
    '<div style="position:absolute;left:42%;top:22%;width:42%;height:32%;background:linear-gradient(180deg,#d4f2ff,#5aa0c8);' +
    'border:2px solid #1b110a;border-radius:8px;"></div>';
  return el;
}

/** Skeld cafeteria vote, then the airlock. Winner is the crewmate who gets ejected. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const n = order.length;
  const CHECK_MS = Math.max(280, Math.min(420, Math.round(2200 / n)));
  const REVEAL_MS = 220;
  const meetIntro = 700;
  const voteMs = n * CHECK_MS + 250;
  const revealMs = 400 + n * REVEAL_MS;
  const hatchMs = 500;
  const flyMs = 1400;
  const holdMs = 750;
  const meetMs = meetIntro + voteMs + revealMs;

  const headline = document.createElement('div');
  headline.textContent = 'Among Us';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 640;
  const stageH = 420;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:#1a1e28;border:5px solid #1b110a;border-radius:12px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Emergency Meeting';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:10px;text-align:center;z-index:20;' +
    'font-family:"Rye","Times New Roman",serif;font-size:16px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #000;';
  stage.appendChild(caption);

  const meet = document.createElement('div');
  meet.style.cssText =
    'position:absolute;inset:0;z-index:6;transition:opacity 0.35s;';
  stage.appendChild(meet);

  // Cafeteria wall + floor
  const wall = document.createElement('div');
  wall.style.cssText =
    'position:absolute;inset:0;background:linear-gradient(180deg,#3a4458 0%,#2a3344 48%,#4a4030 49%,#3a3224 100%);';
  meet.appendChild(wall);
  const stripe = document.createElement('div');
  stripe.style.cssText =
    'position:absolute;left:0;right:0;top:46%;height:14px;z-index:1;' +
    'background:repeating-linear-gradient(90deg,#f6e27a 0 18px,#1b110a 18px 28px);' +
    'border-top:3px solid #1b110a;border-bottom:3px solid #1b110a;';
  meet.appendChild(stripe);

  const table = document.createElement('div');
  table.style.cssText =
    'position:absolute;left:50%;top:98px;width:180px;height:88px;margin-left:-90px;z-index:3;' +
    'background:radial-gradient(ellipse at 50% 40%,#6a7280,#3a404c);border:4px solid #1b110a;' +
    'border-radius:50%;box-shadow:0 14px 0 rgba(0,0,0,0.35);';
  meet.appendChild(table);
  const btn = document.createElement('div');
  btn.style.cssText =
    'position:absolute;left:50%;top:50%;width:42px;height:42px;margin:-21px 0 0 -21px;' +
    'background:radial-gradient(circle at 35% 30%,#ff6b6b,#c51111 70%,#7a0a0a);' +
    'border:3px solid #1b110a;border-radius:50%;box-shadow:0 0 14px rgba(197,17,17,0.7);';
  table.appendChild(btn);

  const alarm = document.createElement('div');
  alarm.style.cssText =
    'position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;' +
    'background:radial-gradient(ellipse at 50% 20%,rgba(197,17,17,0.35),transparent 70%);';
  meet.appendChild(alarm);

  const scale = n > 8 ? 0.72 : 0.88;
  const crew = order.map(function (person, i) {
    const el = makeCrewmate(person, i, scale);
    const ang = (Math.PI * 1.15) * (i / Math.max(1, n - 1)) - Math.PI * 0.08;
    const cx = 320 + Math.cos(ang) * 200 - 30;
    const cy = 118 + Math.sin(ang) * 52 + (i % 2) * 6;
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.zIndex = String(5 + Math.round(cy / 10));
    meet.appendChild(el);
    return el;
  });

  const board = document.createElement('div');
  board.style.cssText =
    'position:absolute;left:16px;right:16px;bottom:10px;max-height:200px;overflow:auto;z-index:18;' +
    'background:rgba(10,14,22,0.94);border:3px solid #8a93a0;border-radius:8px;padding:8px;' +
    'display:flex;flex-direction:column;gap:5px;' +
    'opacity:0;transform:translateY(14px);transition:opacity 0.3s, transform 0.3s;';
  meet.appendChild(board);

  const rows = order.map(function (person, i) {
    const row = document.createElement('div');
    row.style.cssText =
      'display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:6px;' +
      'background:#1a2230;border:2px solid #3a4458;min-height:34px;' +
      'transition:border-color 0.25s, background 0.25s, transform 0.25s;';
    row.appendChild(miniBean(SUITS[i % SUITS.length], 22));
    const name = document.createElement('div');
    name.textContent = person.name;
    name.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:12px;color:#fbf4dd;flex:0 0 92px;';
    const pile = document.createElement('div');
    pile.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:2px;flex:1;min-height:20px;';
    const mark = document.createElement('div');
    mark.style.cssText =
      'width:22px;height:22px;border-radius:50%;border:2px dashed #5a6474;flex-shrink:0;' +
      'display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#7dff9a;' +
      'transition:background 0.2s, border-color 0.2s, transform 0.25s;';
    row.appendChild(name);
    row.appendChild(pile);
    row.appendChild(mark);
    board.appendChild(row);
    return { row: row, pile: pile, mark: mark };
  });

  const space = document.createElement('div');
  space.style.cssText =
    'position:absolute;inset:0;z-index:5;opacity:0;transition:opacity 0.4s;pointer-events:none;';
  stage.appendChild(space);

  const voidBg = document.createElement('div');
  voidBg.style.cssText =
    'position:absolute;inset:0;background:radial-gradient(ellipse at 30% 40%,#12204a 0%,#050814 55%,#000 100%);';
  space.appendChild(voidBg);

  for (let i = 0; i < 55; i++) {
    const star = document.createElement('div');
    const sz = 1 + Math.random() * 2.4;
    star.style.cssText =
      'position:absolute;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;' +
      'width:' + sz + 'px;height:' + sz + 'px;background:#fff;border-radius:50%;' +
      'opacity:' + (0.25 + Math.random() * 0.75) + ';box-shadow:0 0 4px #fff;';
    space.appendChild(star);
  }

  const hull = document.createElement('div');
  hull.style.cssText =
    'position:absolute;left:-40px;top:40px;width:210px;height:340px;z-index:3;' +
    'background:linear-gradient(90deg,#2a3344,#1a2030);border:4px solid #1b110a;' +
    'border-radius:8px 0 0 8px;box-shadow:inset -20px 0 30px rgba(0,0,0,0.45);';
  hull.innerHTML =
    '<div style="position:absolute;right:18px;top:70px;width:22px;height:70px;background:#0a1020;border:3px solid #6a7380;border-radius:4px;"></div>' +
    '<div style="position:absolute;right:18px;top:170px;width:22px;height:70px;background:#0a1020;border:3px solid #6a7380;border-radius:4px;"></div>' +
    '<div style="position:absolute;left:24px;top:24px;width:70px;height:10px;background:#c51111;border:2px solid #1b110a;"></div>';
  space.appendChild(hull);

  const doorL = document.createElement('div');
  doorL.style.cssText =
    'position:absolute;left:168px;top:88px;width:52px;height:230px;z-index:8;' +
    'background:linear-gradient(90deg,#5a6474,#2a3140);border:4px solid #8a93a0;border-radius:6px 0 0 6px;' +
    'transition:transform 0.5s cubic-bezier(0.2,0.8,0.3,1);box-shadow:inset 0 0 16px #000;';
  const doorR = document.createElement('div');
  doorR.style.cssText =
    'position:absolute;left:220px;top:88px;width:52px;height:230px;z-index:8;' +
    'background:linear-gradient(90deg,#2a3140,#5a6474);border:4px solid #8a93a0;border-radius:0 6px 6px 0;' +
    'transition:transform 0.5s cubic-bezier(0.2,0.8,0.3,1);box-shadow:inset 0 0 16px #000;';
  space.appendChild(doorL);
  space.appendChild(doorR);

  const ejectee = makeCrewmate(winner, targetIndex, 1.15);
  ejectee.style.left = '186px';
  ejectee.style.top = '168px';
  ejectee.style.zIndex = '7';
  ejectee.style.opacity = '0';
  space.appendChild(ejectee);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes amongAlarm { 0%,100% { opacity: 0.05; } 50% { opacity: 0.55; } }' +
    '@keyframes amongBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }' +
    '@keyframes amongTumble { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' +
    '@keyframes amongDrift { 0% { transform: translate(0,0); } 100% { transform: translate(380px,-70px); } }';
  document.head.appendChild(styleEl);

  crew.forEach(function (el, i) {
    el.style.animation = 'amongBob 1.1s ease-in-out ' + (i * 0.08) + 's infinite';
  });
  alarm.style.animation = 'amongAlarm 0.7s ease-in-out infinite';

  document.body.appendChild(overlay);

  setTimeout(function () {
    board.style.opacity = '1';
    board.style.transform = 'translateY(0)';
    caption.textContent = 'Who is the Impostor?';
  }, 180);

  const voteOrder = order.map(function (_, i) { return i; });
  for (let i = voteOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = voteOrder[i];
    voteOrder[i] = voteOrder[j];
    voteOrder[j] = tmp;
  }

  voteOrder.forEach(function (voterI, step) {
    setTimeout(function () {
      const r = rows[voterI];
      r.mark.textContent = '\u2713';
      r.mark.style.border = '2px solid #7dff9a';
      r.mark.style.background = '#16301c';
      r.mark.style.transform = 'scale(1.15)';
      caption.textContent = order[voterI].name + ' voted';
      setTimeout(function () { r.mark.style.transform = 'scale(1)'; }, 180);
    }, meetIntro + step * CHECK_MS);
  });

  setTimeout(function () {
    caption.textContent = 'Votes are in\u2026';
  }, meetIntro + voteMs);

  voteOrder.forEach(function (voterI, step) {
    setTimeout(function () {
      const chip = miniBean(SUITS[voterI % SUITS.length], 16);
      chip.style.transform = 'scale(0.4)';
      chip.style.transition = 'transform 0.2s cubic-bezier(0.3,1.4,0.5,1)';
      rows[targetIndex].pile.appendChild(chip);
      requestAnimationFrame(function () { chip.style.transform = 'scale(1)'; });
      rows[targetIndex].row.style.borderColor = '#c51111';
      rows[targetIndex].row.style.background = '#3a1518';
      caption.textContent = order[voterI].name + ' voted ' + winner.name;
    }, meetIntro + voteMs + 280 + step * REVEAL_MS);
  });

  setTimeout(function () {
    rows[targetIndex].row.style.transform = 'scale(1.03)';
    caption.textContent = winner.name + ' was ejected.';
    meet.style.opacity = '0';
    space.style.opacity = '1';
    space.style.pointerEvents = 'auto';
    ejectee.style.opacity = '1';
  }, meetMs);

  setTimeout(function () {
    doorL.style.transform = 'translateX(-58px)';
    doorR.style.transform = 'translateX(58px)';
  }, meetMs + 80);

  setTimeout(function () {
    const fly = document.createElement('div');
    fly.style.cssText =
      'position:absolute;left:186px;top:168px;width:84px;height:106px;z-index:7;' +
      'animation:amongDrift ' + flyMs + 'ms cubic-bezier(0.25,0.1,0.3,1) forwards;';
    const spin = document.createElement('div');
    spin.style.cssText =
      'width:100%;height:100%;animation:amongTumble 0.9s linear infinite;transform-origin:50% 50%;';
    ejectee.style.left = '0';
    ejectee.style.top = '0';
    ejectee.style.position = 'relative';
    ejectee.style.animation = 'none';
    spin.appendChild(ejectee);
    fly.appendChild(spin);
    space.appendChild(fly);
    caption.textContent = winner.name + ' was ejected.';
  }, meetMs + hatchMs);

  setTimeout(function () {
    caption.textContent = winner.name + ' was not The Impostor.';
  }, meetMs + hatchMs + flyMs * 0.55);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, meetMs + hatchMs + flyMs + holdMs);
}
