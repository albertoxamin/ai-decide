import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'slot';
export const label = 'Slot machine';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];

    const machine = document.createElement('div');
    machine.style.cssText =
      'background:linear-gradient(135deg,#c41e3a,#7a0e1f);border:8px solid #ffcc00;' +
      'border-radius:24px;padding:24px 24px 16px;display:flex;flex-direction:column;align-items:center;' +
      'gap:14px;box-shadow:0 0 40px rgba(255,204,0,0.5),inset 0 0 20px rgba(0,0,0,0.4);';

    const jackpot = document.createElement('div');
    jackpot.textContent = '★ JACKPOT ★';
    jackpot.style.cssText = 'color:#ffcc00;font-weight:900;font-size:18px;letter-spacing:4px;text-shadow:0 2px 4px rgba(0,0,0,0.6);';
    machine.appendChild(jackpot);

    const reelsRow = document.createElement('div');
    reelsRow.style.cssText = 'display:flex;gap:8px;background:#1a1a1a;padding:10px;border-radius:10px;border:3px solid #444;';
    machine.appendChild(reelsRow);

    const reelW = 110;
    const slotH = 110;
    const stripLen = 30;
    const stopDelays = [600, 1500, 2500];

    for (let r = 0; r < 3; r++) {
      const reelWindow = document.createElement('div');
      reelWindow.style.cssText = `width:${reelW}px;height:${slotH}px;overflow:hidden;background:#fff;border-radius:6px;position:relative;border:2px solid #333;`;

      const reel = document.createElement('div');
      reel.style.cssText = 'position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;';

      // Build the strip: random people throughout, winner placed at the last slot so the reel
      // can land with the winner centered in the window.
      const strip = [];
      for (let i = 0; i < stripLen; i++) {
        strip.push(order[Math.floor(Math.random() * order.length)]);
      }
      strip[stripLen - 1] = winner;

      strip.forEach(p => {
        const slot = document.createElement('div');
        slot.style.cssText = `flex-shrink:0;height:${slotH}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:11px;font-weight:700;color:#222;`;
        const img = document.createElement('img');
        img.src = p.avatarUrl;
        img.style.cssText = 'width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid #ffcc00;';
        const name = document.createElement('span');
        name.textContent = p.name.split(' ')[0].slice(0, 10);
        slot.appendChild(img);
        slot.appendChild(name);
        reel.appendChild(slot);
      });

      reelWindow.appendChild(reel);
      reelsRow.appendChild(reelWindow);

      const finalTop = -((stripLen - 1) * slotH);
      setTimeout(() => {
        reel.style.transition = `top ${stopDelays[r]}ms cubic-bezier(0.25, 0.1, 0.2, 1)`;
        reel.style.top = `${finalTop}px`;
      }, 50);
    }

    overlay.appendChild(machine);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Plinko: a ball drops from the top of a peg board, zigzags down through pegs, lands in the
   *  winner's slot at the bottom. Path is a biased random walk that always converges to the target. */
