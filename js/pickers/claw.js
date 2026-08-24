import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'claw';
export const label = 'Claw machine';

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

    // The crane: rail trolley + cable + claw
    const craneX0 = 40;
    const trolley = document.createElement('div');
    trolley.style.cssText =
      `position:absolute;left:${craneX0}px;top:${railY - 10}px;width:36px;height:24px;` +
      'background:linear-gradient(180deg,#aaa,#555);border:2px solid #222;border-radius:4px;' +
      'transition:left 0.85s cubic-bezier(0.4,0,0.6,1);z-index:7;box-shadow:0 2px 4px rgba(0,0,0,0.5);';
    cabinet.appendChild(trolley);

    const cable = document.createElement('div');
    cable.style.cssText =
      `position:absolute;left:${craneX0 + 16}px;top:${railY + 14}px;width:2px;height:40px;` +
      'background:#222;transition:left 0.85s cubic-bezier(0.4,0,0.6,1), height 0.55s cubic-bezier(0.4,0,0.6,1);z-index:6;';
    cabinet.appendChild(cable);

    const claw = document.createElement('div');
    claw.style.cssText =
      `position:absolute;left:${craneX0 - 6}px;top:${railY + 50}px;width:48px;height:36px;` +
      'transition:left 0.85s cubic-bezier(0.4,0,0.6,1), top 0.55s cubic-bezier(0.4,0,0.6,1);z-index:8;';

    const clawCenter = document.createElement('div');
    clawCenter.style.cssText =
      'position:absolute;left:50%;top:0;transform:translateX(-50%);width:18px;height:14px;' +
      'background:linear-gradient(180deg,#ccc,#666);border:2px solid #222;border-radius:4px 4px 2px 2px;';
    claw.appendChild(clawCenter);

    const clawL = document.createElement('div');
    clawL.style.cssText =
      'position:absolute;left:6px;top:10px;width:14px;height:24px;' +
      'background:linear-gradient(135deg,#bbb,#555);border:2px solid #222;border-radius:6px 0 6px 18px;' +
      'transform-origin:top right;transition:transform 0.3s cubic-bezier(0.4,0,0.6,1);';
    claw.appendChild(clawL);

    const clawR = document.createElement('div');
    clawR.style.cssText =
      'position:absolute;right:6px;top:10px;width:14px;height:24px;' +
      'background:linear-gradient(225deg,#bbb,#555);border:2px solid #222;border-radius:0 6px 18px 6px;' +
      'transform-origin:top left;transition:transform 0.3s cubic-bezier(0.4,0,0.6,1);';
    claw.appendChild(clawR);

    cabinet.appendChild(claw);

    overlay.appendChild(cabinet);
    document.body.appendChild(overlay);

    const winnerInfo = plushEls[winnerVisualIdx];
    const targetCraneX = winnerInfo.x + plushSize / 2 - 18;
    const trolleyTargetX = winnerInfo.x + plushSize / 2 - 18;
    const dropDepth = winnerInfo.y - railY - 50 - 4;

    const t1 = 100;                              // start: glide claw to winner column
    const t2 = t1 + 950;                         // descend
    const t3 = t2 + 700;                         // close grip
    const t4 = t3 + 450;                         // ascend with plush
    const t5 = t4 + 750;                         // glide to chute
    const t6 = t5 + 950;                         // descend into chute & release
    const t7 = t6 + 600;                         // plush lands in tray

    setTimeout(() => {
      trolley.style.left = `${trolleyTargetX}px`;
      cable.style.left = `${trolleyTargetX + 16}px`;
      claw.style.left = `${targetCraneX}px`;
    }, t1);

    setTimeout(() => {
      cable.style.height = `${dropDepth + 50}px`;
      claw.style.top = `${winnerInfo.y - 10}px`;
    }, t2);

    setTimeout(() => {
      clawL.style.transform = 'rotate(35deg)';
      clawR.style.transform = 'rotate(-35deg)';
      // Lift the plush along with the claw (attach visually).
      winnerInfo.el.style.zIndex = '9';
    }, t3);

    setTimeout(() => {
      cable.style.height = '40px';
      claw.style.top = `${railY + 50}px`;
      winnerInfo.el.style.left = `${targetCraneX + 18 - plushSize / 2}px`;
      winnerInfo.el.style.top = `${railY + 86}px`;
    }, t4);

    setTimeout(() => {
      const chuteCenter = chuteX + 25 - 18;
      trolley.style.left = `${chuteCenter}px`;
      cable.style.left = `${chuteCenter + 16}px`;
      claw.style.left = `${chuteCenter}px`;
      winnerInfo.el.style.left = `${chuteCenter + 18 - plushSize / 2}px`;
    }, t5);

    setTimeout(() => {
      // Open claw & release plush; it falls into the tray
      clawL.style.transform = 'rotate(0deg)';
      clawR.style.transform = 'rotate(0deg)';
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
