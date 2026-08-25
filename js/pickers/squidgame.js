import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'squidgame';
export const label = 'Squid Game';

function uid() {
  return 'sg_' + Math.random().toString(36).slice(2, 9);
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

function makeDoll(ns) {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;top:4px;left:50%;width:92px;height:118px;margin-left:-46px;z-index:5;' +
    'transform-origin:50% 20%;transition:transform 0.4s ease-in-out;';
  el.innerHTML =
    '<svg viewBox="0 0 92 118" width="92" height="118" aria-hidden="true">' +
      '<ellipse cx="46" cy="114" rx="26" ry="4" fill="#000" opacity="0.22"/>' +
      '<path d="M22 56 C20 78 26 102 46 108 C66 102 72 78 70 56 C62 62 30 62 22 56 Z" fill="#ed6ea6" stroke="#1b110a" stroke-width="2.6"/>' +
      '<path d="M28 56 H64 L70 92 C66 102 26 102 22 92 Z" fill="#f24f8a" stroke="#1b110a" stroke-width="2.4"/>' +
      '<circle cx="46" cy="34" r="22" fill="#f3d2b3" stroke="#1b110a" stroke-width="2.6"/>' +
      '<path d="M28 24 C18 4 40 2 46 16" fill="none" stroke="#1b110a" stroke-width="3.4" stroke-linecap="round"/>' +
      '<path d="M64 24 C74 4 52 2 46 16" fill="none" stroke="#1b110a" stroke-width="3.4" stroke-linecap="round"/>' +
      '<circle cx="22" cy="14" r="8" fill="#f3d2b3" stroke="#1b110a" stroke-width="2.2"/>' +
      '<circle cx="70" cy="14" r="8" fill="#f3d2b3" stroke="#1b110a" stroke-width="2.2"/>' +
      '<circle cx="38" cy="34" r="3.4" fill="#1b110a"/>' +
      '<circle cx="54" cy="34" r="3.4" fill="#1b110a"/>' +
      '<circle cx="39" cy="33" r="1" fill="#fbf4dd"/>' +
      '<circle cx="55" cy="33" r="1" fill="#fbf4dd"/>' +
      '<path d="M40 44 Q46 48 52 44" fill="none" stroke="#1b110a" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>';
  return el;
}

/** Red light / green light: numbered players freeze while the doll turns. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #3a1028 0%, #0a0408 72%)';
  const ns = uid();

  const headline = document.createElement('div');
  headline.textContent = 'Squid Game';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#ed6ea6;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const w = 720;
  const h = 420;
  const finishY = 92;
  const startY = h - 86;

  const field = document.createElement('div');
  field.style.cssText =
    'position:relative;width:' + w + 'px;height:' + h + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#ed9b6a 0%,#d4a373 38%,#c08a5a 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(field);

  const doll = makeDoll(ns);
  doll.style.transform = 'rotateY(180deg)';
  field.appendChild(doll);

  const fLine = document.createElement('div');
  fLine.style.cssText =
    'position:absolute;top:' + finishY + 'px;left:0;right:0;height:8px;z-index:1;' +
    'background:repeating-linear-gradient(90deg,#fbf4dd 0 14px,#1b110a 14px 28px);';
  field.appendChild(fLine);

  const light = document.createElement('div');
  light.style.cssText =
    'position:absolute;top:12px;left:16px;z-index:6;' +
    'font-family:"Rye","Times New Roman",serif;font-size:12px;letter-spacing:1.5px;color:#fbf4dd;' +
    'background:#2c5d52;padding:7px 14px;border:3px solid #1b110a;border-radius:2px;' +
    'box-shadow:3px 3px 0 #1b110a;transition:background 0.12s;';
  light.textContent = 'GREEN LIGHT';
  field.appendChild(light);

  const playerW = 42;
  const gap = 12;
  const totalW = order.length * (playerW + gap) - gap;
  const playerStartX = (w - totalW) / 2;

  const layout = shuffle(order.map((_, i) => i));
  const winnerVisualIdx = layout.indexOf(targetIndex);

  const playerEls = [];
  layout.forEach((orderIdx, visualIdx) => {
    const person = order[orderIdx];
    const player = document.createElement('div');
    const x = playerStartX + visualIdx * (playerW + gap);
    player.style.cssText =
      'position:absolute;left:' + x + 'px;top:' + startY + 'px;width:' + playerW + 'px;' +
      'display:flex;flex-direction:column;align-items:center;gap:3px;z-index:3;' +
      'transition:top 0.4s linear, opacity 0.3s;';

    const suit = document.createElement('div');
    suit.style.cssText =
      'width:28px;height:18px;margin-top:-2px;background:#2c5d52;border:2px solid #1b110a;' +
      'border-radius:4px 4px 6px 6px;';

    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'width:' + playerW + 'px;height:' + playerW + 'px;border-radius:50%;object-fit:cover;' +
      'border:3px solid #1b110a;background:#fbf4dd;transition:border-color 0.3s, box-shadow 0.3s;';

    const name = document.createElement('span');
    name.textContent = person.name.split(' ')[0].slice(0, 7);
    name.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:9px;color:#1b110a;' +
      'text-shadow:0 1px 0 rgba(251,244,221,0.7);width:100%;text-align:center;';

    player.appendChild(img);
    player.appendChild(suit);
    player.appendChild(name);
    field.appendChild(player);
    playerEls.push({ player: player, img: img, currentY: startY });
  });

  document.body.appendChild(overlay);

  const phases = [
    { state: 'green', dur: 800 },
    { state: 'red', dur: 400 },
    { state: 'green', dur: 700 },
    { state: 'red', dur: 350 },
    { state: 'green', dur: 750 },
  ];
  const totalDistance = startY - finishY - 8;
  const totalGreenMs = phases.filter((p) => p.state === 'green').reduce((s, p) => s + p.dur, 0);
  const playerSpeeds = playerEls.map((_, i) =>
    i === winnerVisualIdx
      ? totalDistance / totalGreenMs
      : (totalDistance * (0.6 + Math.random() * 0.32)) / totalGreenMs
  );

  let elapsed = 80;
  phases.forEach((phase) => {
    const start = elapsed;
    setTimeout(() => {
      light.textContent = phase.state === 'green' ? 'GREEN LIGHT' : 'RED LIGHT';
      light.style.background = phase.state === 'green' ? '#2c5d52' : '#c83a1e';
      doll.style.transform = phase.state === 'green' ? 'rotateY(180deg)' : 'rotateY(0deg)';

      if (phase.state === 'green') {
        playerEls.forEach((p, i) => {
          p.currentY = Math.max(finishY, p.currentY - playerSpeeds[i] * phase.dur);
          p.player.style.transition = 'top ' + phase.dur + 'ms linear';
          p.player.style.top = p.currentY + 'px';
        });
      } else {
        playerEls.forEach((p) => {
          p.player.style.transition = 'top 0.08s';
        });
      }
    }, start);
    elapsed += phase.dur;
  });

  setTimeout(() => {
    playerEls[winnerVisualIdx].img.style.boxShadow = '0 0 18px #f6e27a, 0 0 36px #ed6ea6';
    playerEls[winnerVisualIdx].img.style.borderColor = '#f6e27a';
    playerEls.forEach((p, i) => {
      if (i !== winnerVisualIdx) p.player.style.opacity = '0.4';
    });
  }, elapsed - 100);

  setTimeout(() => {
    overlay.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 120);
}
