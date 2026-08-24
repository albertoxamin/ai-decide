import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'claw';
export const label = 'Claw machine';

function steelStops(id) {
  return (
    '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#f6f7f8"/>' +
      '<stop offset="20%" stop-color="#c9ced4"/>' +
      '<stop offset="48%" stop-color="#8a919a"/>' +
      '<stop offset="78%" stop-color="#2f353c"/>' +
      '<stop offset="100%" stop-color="#b7bcc3"/>' +
    '</linearGradient>'
  );
}

function makeClawFinger(side) {
  const isLeft = side === 'left';
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;top:14px;width:30px;height:48px;z-index:2;' +
    (isLeft ? 'left:2px;' : 'right:2px;') +
    'transform-origin:' + (isLeft ? '23px 6px' : '7px 6px') + ';' +
    'transform:rotate(' + (isLeft ? '-24deg' : '24deg') + ');' +
    'transition:transform 0.32s cubic-bezier(0.4,0,0.6,1);';
  const gid = 'clawSteel' + side;
  el.innerHTML =
    '<svg viewBox="0 0 30 48" width="30" height="48" aria-hidden="true">' +
      '<defs>' + steelStops(gid) + '</defs>' +
      '<g' + (isLeft ? '' : ' transform="translate(30,0) scale(-1,1)"') + '>' +
        '<path d="M19 1.5 h8.5 v11 L24 27 h-9 L20.5 13 V1.5 Z" fill="url(#' + gid + ')" stroke="#1b110a" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M13 25.5 h12 L7 46.5 1.8 41.2 16 27.5 Z" fill="url(#' + gid + ')" stroke="#1b110a" stroke-width="1.7" stroke-linejoin="round"/>' +
        '<path d="M21 4 v8" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.3" stroke-linecap="round"/>' +
        '<circle cx="23.2" cy="5.8" r="3.1" fill="#f0c93a" stroke="#1b110a" stroke-width="1.4"/>' +
        '<circle cx="18.5" cy="27" r="2.6" fill="#f0c93a" stroke="#1b110a" stroke-width="1.3"/>' +
        '<circle cx="23.2" cy="5.8" r="1" fill="#3a2a10"/>' +
        '<circle cx="18.5" cy="27" r="0.8" fill="#3a2a10"/>' +
      '</g>' +
    '</svg>';
  return el;
}

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const w = 460;
    const h = 500;
    const railY = 56;
    const heapTop = 280;
    const heapBottom = 410;
    const chuteX = w - 70;
    const trayY = h - 70;

    const cabinet = document.createElement('div');
    cabinet.style.cssText =
      `position:relative;width:${w}px;height:${h}px;` +
      'background:linear-gradient(180deg,#2a1a3e 0%,#1a0a2e 100%);' +
      'border-radius:16px;border:6px solid #ff3b8a;' +
      'box-shadow:0 0 40px rgba(255,59,138,0.4),inset 0 0 30px rgba(0,0,0,0.6);overflow:hidden;';

    // Glass reflection panel
    const glass = document.createElement('div');
    glass.style.cssText =
      'position:absolute;inset:18px;border:2px solid rgba(255,255,255,0.15);border-radius:8px;' +
      'background:linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 40%,rgba(255,255,255,0.04) 100%);' +
      'pointer-events:none;z-index:5;';
    cabinet.appendChild(glass);

    // Top crane rail
    const rail = document.createElement('div');
    rail.style.cssText =
      `position:absolute;left:20px;right:20px;top:${railY}px;height:6px;` +
      'background:linear-gradient(180deg,#888,#444);border-radius:3px;box-shadow:0 2px 4px rgba(0,0,0,0.5);';
    cabinet.appendChild(rail);

    // Prize chute on the right
    const chute = document.createElement('div');
    chute.style.cssText =
      `position:absolute;left:${chuteX}px;top:${railY + 20}px;width:50px;height:${trayY - railY - 20}px;` +
      'background:linear-gradient(180deg,rgba(255,59,138,0.15),rgba(255,59,138,0.05));' +
      'border:2px dashed rgba(255,59,138,0.6);border-radius:8px;';
    cabinet.appendChild(chute);

    // Reward tray at the bottom
    const tray = document.createElement('div');
    tray.style.cssText =
      `position:absolute;left:20px;right:20px;top:${trayY}px;bottom:14px;` +
      'background:linear-gradient(180deg,#3a2a1a,#2a1a0a);border:3px solid #5a3f1f;border-radius:8px;' +
      'display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:11px;font-weight:700;' +
      'letter-spacing:2px;text-shadow:0 1px 2px rgba(0,0,0,0.6);';
    tray.textContent = 'PRIZES';
    cabinet.appendChild(tray);

    // Plushies (avatars) heaped at the bottom
    const plushSize = 52;
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);
    const plushColors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55'];

    const plushEls = [];
    const heapWidth = chuteX - 40;
    const cols = Math.max(2, Math.ceil(Math.sqrt(layout.length * 1.6)));
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const col = visualIdx % cols;
      const row = Math.floor(visualIdx / cols);
      const colW = heapWidth / cols;
      const x = 30 + col * colW + colW / 2 - plushSize / 2 + (Math.random() - 0.5) * 10;
      const y = heapBottom - plushSize - row * (plushSize - 8) + (Math.random() - 0.5) * 4;

      const plush = document.createElement('div');
      plush.style.cssText =
        `position:absolute;left:${x}px;top:${y}px;width:${plushSize}px;height:${plushSize}px;` +
        'transition:left 0.6s cubic-bezier(0.4,0,0.6,1), top 0.6s cubic-bezier(0.4,0,0.6,1), opacity 0.4s, transform 0.5s;' +
        'z-index:2;';
      const body = document.createElement('div');
      body.style.cssText =
        `position:absolute;inset:0;background:radial-gradient(circle at 35% 30%,${plushColors[visualIdx % plushColors.length]},#222 110%);` +
        'border-radius:50%;box-shadow:0 3px 6px rgba(0,0,0,0.6),inset -4px -4px 8px rgba(0,0,0,0.3);';
      const ear1 = document.createElement('div');
      ear1.style.cssText = `position:absolute;top:-6px;left:8px;width:14px;height:14px;background:${plushColors[visualIdx % plushColors.length]};border-radius:50%;border:1px solid rgba(0,0,0,0.4);`;
      const ear2 = document.createElement('div');
      ear2.style.cssText = `position:absolute;top:-6px;right:8px;width:14px;height:14px;background:${plushColors[visualIdx % plushColors.length]};border-radius:50%;border:1px solid rgba(0,0,0,0.4);`;
      const face = document.createElement('img');
      face.src = person.avatarUrl;
      face.style.cssText =
        `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);` +
        `width:${plushSize - 14}px;height:${plushSize - 14}px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.85);`;

      plush.appendChild(body);
      plush.appendChild(ear1);
      plush.appendChild(ear2);
      plush.appendChild(face);
      cabinet.appendChild(plush);
      plushEls.push({ el: plush, x, y });
    });

    // The crane: rail trolley + cable + 3-prong arcade claw
    const trolleyW = 44;
    const clawW = 72;
    const clawH = 52;
    const cableRestH = 36;
    const craneX0 = 40;
    const clawPadX = (trolleyW - clawW) / 2;

    const trolley = document.createElement('div');
    trolley.style.cssText =
      `position:absolute;left:${craneX0}px;top:${railY - 12}px;width:${trolleyW}px;height:26px;` +
      'transition:left 0.85s cubic-bezier(0.4,0,0.6,1);z-index:7;';
    trolley.innerHTML =
      '<svg viewBox="0 0 44 26" width="44" height="26" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="trolleyPaint" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#ffe566"/>' +
            '<stop offset="55%" stop-color="#f0c020"/>' +
            '<stop offset="100%" stop-color="#b07a00"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<rect x="3" y="3" width="38" height="16" rx="3" fill="url(#trolleyPaint)" stroke="#1b110a" stroke-width="2"/>' +
        '<rect x="8" y="7" width="28" height="5" rx="1" fill="#2a2e34" stroke="#1b110a" stroke-width="1"/>' +
        '<circle cx="12" cy="20" r="4.6" fill="#6a7078" stroke="#1b110a" stroke-width="1.6"/>' +
        '<circle cx="32" cy="20" r="4.6" fill="#6a7078" stroke="#1b110a" stroke-width="1.6"/>' +
        '<circle cx="12" cy="20" r="1.5" fill="#ddd"/>' +
        '<circle cx="32" cy="20" r="1.5" fill="#ddd"/>' +
      '</svg>';
    cabinet.appendChild(trolley);

    const cable = document.createElement('div');
    cable.style.cssText =
      `position:absolute;left:${craneX0 + trolleyW / 2 - 1.5}px;top:${railY + 12}px;width:3px;height:${cableRestH}px;` +
      'background:linear-gradient(90deg,#bbb 0%,#555 35%,#222 70%,#777 100%);' +
      'border-radius:1px;box-shadow:1px 0 0 #111;' +
      'transition:left 0.85s cubic-bezier(0.4,0,0.6,1), height 0.55s cubic-bezier(0.4,0,0.6,1);z-index:6;';
    cabinet.appendChild(cable);

    const claw = document.createElement('div');
    claw.style.cssText =
      `position:absolute;left:${craneX0 + clawPadX}px;top:${railY + 12 + cableRestH}px;width:${clawW}px;height:${clawH}px;` +
      'transition:left 0.85s cubic-bezier(0.4,0,0.6,1), top 0.55s cubic-bezier(0.4,0,0.6,1);z-index:8;' +
      'filter:drop-shadow(0 3px 2px rgba(0,0,0,0.45));';

    const clawBack = document.createElement('div');
    clawBack.style.cssText =
      'position:absolute;left:50%;top:16px;width:16px;height:36px;margin-left:-8px;z-index:0;' +
      'transform-origin:50% 3px;transition:transform 0.32s cubic-bezier(0.4,0,0.6,1);';
    clawBack.innerHTML =
      '<svg viewBox="0 0 16 36" width="16" height="36" aria-hidden="true">' +
        '<defs>' + steelStops('clawSteelBack') + '</defs>' +
        '<path d="M5 1.5 h6 v12 L9 33 7 33 5 13.5 Z" fill="url(#clawSteelBack)" stroke="#1b110a" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M4 31 h8 L8 35.5 Z" fill="url(#clawSteelBack)" stroke="#1b110a" stroke-width="1.4" stroke-linejoin="round"/>' +
      '</svg>';
    claw.appendChild(clawBack);

    const clawL = makeClawFinger('left');
    const clawR = makeClawFinger('right');
    claw.appendChild(clawL);
    claw.appendChild(clawR);

    const clawCenter = document.createElement('div');
    clawCenter.style.cssText =
      'position:absolute;left:50%;top:0;width:34px;height:24px;margin-left:-17px;z-index:3;';
    clawCenter.innerHTML =
      '<svg viewBox="0 0 34 24" width="34" height="24" aria-hidden="true">' +
        '<defs>' +
          '<linearGradient id="clawHubY" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#ffe566"/>' +
            '<stop offset="55%" stop-color="#e8b41c"/>' +
            '<stop offset="100%" stop-color="#8a5a08"/>' +
          '</linearGradient>' +
          steelStops('clawHubSteel') +
        '</defs>' +
        '<rect x="12" y="0" width="10" height="7" rx="1.2" fill="url(#clawHubSteel)" stroke="#1b110a" stroke-width="1.5"/>' +
        '<ellipse cx="17" cy="14" rx="15" ry="9" fill="url(#clawHubY)" stroke="#1b110a" stroke-width="1.8"/>' +
        '<ellipse cx="17" cy="12.2" rx="10" ry="4.2" fill="rgba(255,255,255,0.22)"/>' +
        '<circle cx="17" cy="15" r="3.4" fill="url(#clawHubSteel)" stroke="#1b110a" stroke-width="1.3"/>' +
        '<circle cx="17" cy="15" r="1.2" fill="#1b110a"/>' +
      '</svg>';
    claw.appendChild(clawCenter);

    cabinet.appendChild(claw);

    overlay.appendChild(cabinet);
    document.body.appendChild(overlay);

    const winnerInfo = plushEls[winnerVisualIdx];
    const trolleyTargetX = winnerInfo.x + plushSize / 2 - trolleyW / 2;
    const clawRestTop = railY + 12 + cableRestH;
    const dropDepth = winnerInfo.y - clawRestTop - 8;

    function parkCrane(trolleyX) {
      trolley.style.left = `${trolleyX}px`;
      cable.style.left = `${trolleyX + trolleyW / 2 - 1.5}px`;
      claw.style.left = `${trolleyX + clawPadX}px`;
    }

    const t1 = 100;                              // start: glide claw to winner column
    const t2 = t1 + 950;                         // descend
    const t3 = t2 + 700;                         // close grip
    const t4 = t3 + 450;                         // ascend with plush
    const t5 = t4 + 750;                         // glide to chute
    const t6 = t5 + 950;                         // descend into chute & release
    const t7 = t6 + 600;                         // plush lands in tray

    setTimeout(() => {
      parkCrane(trolleyTargetX);
    }, t1);

    setTimeout(() => {
      cable.style.height = `${dropDepth + cableRestH}px`;
      claw.style.top = `${winnerInfo.y - 8}px`;
    }, t2);

    setTimeout(() => {
      clawL.style.transform = 'rotate(26deg)';
      clawR.style.transform = 'rotate(-26deg)';
      clawBack.style.transform = 'translateY(5px) scaleY(0.9)';
      winnerInfo.el.style.zIndex = '9';
    }, t3);

    setTimeout(() => {
      cable.style.height = `${cableRestH}px`;
      claw.style.top = `${clawRestTop}px`;
      winnerInfo.el.style.left = `${trolleyTargetX + trolleyW / 2 - plushSize / 2}px`;
      winnerInfo.el.style.top = `${clawRestTop + 18}px`;
    }, t4);

    setTimeout(() => {
      const chuteTrolleyX = chuteX + 25 - trolleyW / 2;
      parkCrane(chuteTrolleyX);
      winnerInfo.el.style.left = `${chuteTrolleyX + trolleyW / 2 - plushSize / 2}px`;
    }, t5);

    setTimeout(() => {
      clawL.style.transform = 'rotate(-24deg)';
      clawR.style.transform = 'rotate(24deg)';
      clawBack.style.transform = 'none';
      winnerInfo.el.style.transition = 'top 0.55s cubic-bezier(0.55, 0, 0.7, 1), transform 0.55s, box-shadow 0.4s';
      winnerInfo.el.style.top = `${trayY - plushSize / 2}px`;
      winnerInfo.el.style.transform = 'scale(1.1)';
      winnerInfo.el.style.zIndex = '12';
      winnerInfo.el.style.filter = 'drop-shadow(0 0 20px rgba(255,204,0,0.85))';
    }, t6);

    setTimeout(() => {
      tray.textContent = '';
    }, t7);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, Math.max(CONFIG.spinDuration + 100, t7 + 400));
  }

  /** Hot potato: avatars stand in a circle around a glowing, sparking potato that hops
   *  from player to player. The hopping accelerates, then slows, and the potato lands
   *  on the winner where it explodes in confetti and sparks. */
