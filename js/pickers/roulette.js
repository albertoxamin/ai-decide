import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'roulette';
export const label = 'Russian roulette';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const cylSize = 340;
    const chSize = 64;
    const radius = cylSize / 2 - chSize / 2 - 22;

    const wrap = document.createElement('div');
    wrap.style.cssText = `position:relative;width:${cylSize}px;height:${cylSize}px;`;

    const pointer = document.createElement('div');
    pointer.style.cssText =
      'position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:0;height:0;' +
      'border-left:16px solid transparent;border-right:16px solid transparent;border-top:28px solid #ff3b30;' +
      'z-index:10;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));transition:filter 0.15s;';
    wrap.appendChild(pointer);

    const cylinder = document.createElement('div');
    cylinder.style.cssText =
      `position:absolute;inset:0;border-radius:50%;` +
      `background:radial-gradient(circle at 30% 30%,#888,#222);border:6px solid #1a1a1a;` +
      `box-shadow:0 0 30px rgba(0,0,0,0.6),inset 0 0 30px rgba(0,0,0,0.5);` +
      `transition:transform ${CONFIG.spinDuration}ms cubic-bezier(0.2,0.7,0.2,1);transform:rotate(0deg);`;

    const n = order.length;
    // Place winner at angular position 0 (top, under the pointer); fill the rest clockwise.
    for (let i = 0; i < n; i++) {
      const person = order[(targetIndex + i) % n];
      const angleDeg = (i / n) * 360;
      const rad = (angleDeg - 90) * Math.PI / 180;
      const cx = cylSize / 2 + radius * Math.cos(rad) - chSize / 2;
      const cy = cylSize / 2 + radius * Math.sin(rad) - chSize / 2;

      const chamber = document.createElement('div');
      chamber.style.cssText =
        `position:absolute;left:${cx}px;top:${cy}px;width:${chSize}px;height:${chSize}px;` +
        `border-radius:50%;background:#1a1a1a;border:3px solid #444;` +
        `box-shadow:inset 0 0 10px rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;overflow:hidden;`;
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = `width:${chSize - 12}px;height:${chSize - 12}px;border-radius:50%;object-fit:cover;opacity:0.85;`;
      chamber.appendChild(img);
      cylinder.appendChild(chamber);
    }

    wrap.appendChild(cylinder);
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);

    const spins = 5 + Math.floor(Math.random() * 3);
    setTimeout(() => {
      cylinder.style.transform = `rotate(${spins * 360}deg)`;
    }, 50);

    // BANG! flash + overlay text when the cylinder locks
    setTimeout(() => {
      pointer.style.filter = 'drop-shadow(0 0 24px #ffcc00) brightness(2.2)';

      const bang = document.createElement('div');
      bang.textContent = '💥 BANG! 💥';
      bang.style.cssText =
        `position:absolute;top:50%;left:50%;` +
        `transform:translate(-50%,-50%) scale(0) rotate(${(Math.random() - 0.5) * 16}deg);` +
        `font-size:64px;font-weight:900;color:#ffcc00;` +
        `text-shadow:0 0 14px #ff3b30, 0 0 28px #ff3b30, 4px 4px 0 #000;` +
        `letter-spacing:4px;z-index:20;pointer-events:none;white-space:nowrap;` +
        `transition:transform 0.28s cubic-bezier(0.34, 1.8, 0.64, 1);`;
      wrap.appendChild(bang);

      // Brief muzzle flash overlay across the whole wrap
      const flash = document.createElement('div');
      flash.style.cssText =
        'position:absolute;inset:-40px;background:radial-gradient(circle,rgba(255,204,0,0.55) 0%,rgba(255,59,48,0.35) 30%,transparent 60%);' +
        'pointer-events:none;z-index:15;opacity:0;transition:opacity 0.12s ease-out;';
      wrap.appendChild(flash);

      requestAnimationFrame(() => {
        bang.style.transform = `translate(-50%,-50%) scale(1.15) rotate(${(Math.random() - 0.5) * 10}deg)`;
        flash.style.opacity = '1';
      });
      setTimeout(() => { flash.style.opacity = '0'; }, 220);
    }, CONFIG.spinDuration);

    // Hold the BANG on screen so you actually see it before the winner popup opens.
    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 800);
  }

  /** Horse race: each participant gets a lane with a horse + avatar; horses gallop toward the
   *  finish line, the winner crosses first while the others stop just short. */
