import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'plinko';
export const label = 'Plinko';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const w = 380;
    const h = 460;
    const board = document.createElement('div');
    board.style.cssText =
      `position:relative;width:${w}px;height:${h}px;background:linear-gradient(180deg,#1a1a2e,#0f0f1e);` +
      `border-radius:14px;border:3px solid #555;overflow:hidden;box-shadow:0 0 30px rgba(0,0,0,0.5);`;

    // Pegs: 7 staggered rows
    const rows = 7;
    const topPad = 50;
    const bottomPad = 110;
    const pegSize = 6;
    for (let r = 0; r < rows; r++) {
      const pegsInRow = r + 4;
      const rowY = topPad + (r / (rows - 1)) * (h - topPad - bottomPad);
      const spacing = w / (pegsInRow + 1);
      for (let c = 0; c < pegsInRow; c++) {
        const peg = document.createElement('div');
        peg.style.cssText =
          `position:absolute;left:${spacing * (c + 1) - pegSize / 2}px;top:${rowY}px;` +
          `width:${pegSize}px;height:${pegSize}px;border-radius:50%;background:#ddd;box-shadow:0 0 4px #fff;`;
        board.appendChild(peg);
      }
    }

    // Slots along the bottom: shuffle the visual layout so the winner's column is random
    // each spin (otherwise targetIndex=0 always means the leftmost slot).
    const slotCount = order.length;
    const slotW = w / slotCount;
    const slotY = h - bottomPad + 10;

    const slotLayout = order.map((_, i) => i);
    for (let i = slotLayout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slotLayout[i], slotLayout[j]] = [slotLayout[j], slotLayout[i]];
    }
    const winnerVisualSlot = slotLayout.indexOf(targetIndex);

    let winnerSlotEl = null;
    let winnerSlotImg = null;
    slotLayout.forEach((orderIdx, visualIdx) => {
      const p = order[orderIdx];
      const slot = document.createElement('div');
      const isWinner = orderIdx === targetIndex;
      slot.style.cssText =
        `position:absolute;left:${visualIdx * slotW}px;top:${slotY}px;width:${slotW}px;height:${bottomPad - 10}px;` +
        `border-left:1px solid #444;border-right:1px solid #444;display:flex;flex-direction:column;` +
        `align-items:center;justify-content:flex-end;padding-bottom:10px;gap:4px;color:#fff;font-size:9px;text-align:center;` +
        `transition:background 0.3s ease-out, box-shadow 0.3s ease-out;`;
      const img = document.createElement('img');
      img.src = p.avatarUrl;
      img.style.cssText = 'width:26px;height:26px;border-radius:50%;object-fit:cover;opacity:0.7;transition:opacity 0.3s ease-out;';
      const name = document.createElement('span');
      name.textContent = p.name.split(' ')[0].slice(0, 8);
      name.style.opacity = '0.85';
      slot.appendChild(img);
      slot.appendChild(name);
      board.appendChild(slot);
      if (isWinner) {
        winnerSlotEl = slot;
        winnerSlotImg = img;
      }
    });

    // Ball: starts above the first row, biased random-walks down to the winner's slot
    const ballSize = 16;
    const startX = w / 2;
    const startY = 18;
    const ball = document.createElement('div');
    ball.style.cssText =
      `position:absolute;left:${startX - ballSize / 2}px;top:${startY}px;width:${ballSize}px;height:${ballSize}px;` +
      `border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#ff3b30 60%);` +
      `box-shadow:0 0 10px rgba(255,59,48,0.6);z-index:10;`;
    board.appendChild(ball);

    const targetX = (winnerVisualSlot + 0.5) * slotW;
    const waypoints = [];
    let curX = startX;
    for (let r = 0; r < rows; r++) {
      const rowY = topPad + (r / (rows - 1)) * (h - topPad - bottomPad);
      const remaining = rows - r;
      const drift = (targetX - curX) / remaining;
      const jitter = (Math.random() - 0.5) * 50;
      curX = Math.max(20, Math.min(w - 20, curX + drift * 1.4 + jitter * 0.6));
      waypoints.push({ x: curX, y: rowY + 8 });
    }
    waypoints.push({ x: targetX, y: slotY + 35 });

    overlay.appendChild(board);
    document.body.appendChild(overlay);

    const stepMs = (CONFIG.spinDuration - 200) / waypoints.length;
    waypoints.forEach((wp, i) => {
      setTimeout(() => {
        ball.style.transition = `left ${stepMs}ms cubic-bezier(0.45,0,0.55,1), top ${stepMs}ms cubic-bezier(0.4,0,0.7,1)`;
        ball.style.left = `${wp.x - ballSize / 2}px`;
        ball.style.top = `${wp.y}px`;
      }, 80 + i * stepMs);
    });

    // Light up the winner slot only when the ball reaches the bottom row.
    const landAt = 80 + waypoints.length * stepMs;
    setTimeout(() => {
      if (winnerSlotEl) {
        winnerSlotEl.style.background = 'linear-gradient(180deg,transparent,rgba(52,199,89,0.45))';
        winnerSlotEl.style.boxShadow = 'inset 0 -22px 28px rgba(52,199,89,0.35)';
      }
      if (winnerSlotImg) {
        winnerSlotImg.style.opacity = '1';
      }
    }, landAt);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Russian-roulette cylinder: chambers arranged radially around a revolver cylinder; the
   *  cylinder spins and lands with the winner under the firing-position pointer. */
