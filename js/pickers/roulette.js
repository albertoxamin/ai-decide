import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'roulette';
export const label = 'Russian roulette';

/** Steel cylinder on felt: chambers spin under the hammer, then one fires. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #241008 0%, #080604 72%)';

  const headline = document.createElement('div');
  headline.textContent = 'Russian Roulette';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const cylSize = 360;
  const chSize = 62;
  const radius = cylSize / 2 - chSize / 2 - 28;

  const table = document.createElement('div');
  table.style.cssText =
    'position:relative;width:460px;height:500px;display:flex;align-items:center;justify-content:center;' +
    'background:radial-gradient(ellipse at 50% 42%,#2c5d52 0%,#143028 70%,#0c1814 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(table);

  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:relative;width:' + cylSize + 'px;height:' + (cylSize + 36) + 'px;';
  table.appendChild(wrap);

  const hammer = document.createElement('div');
  hammer.style.cssText =
    'position:absolute;top:-6px;left:50%;width:36px;height:52px;margin-left:-18px;z-index:12;';
  hammer.innerHTML =
    '<svg viewBox="0 0 36 52" width="36" height="52" aria-hidden="true">' +
      '<path d="M10 6 H26 V20 L20 28 V48 H16 V28 L10 20 Z" fill="#d4af37" stroke="#1b110a" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<rect x="8" y="2" width="20" height="10" rx="3" fill="#f6e27a" stroke="#1b110a" stroke-width="2.2"/>' +
    '</svg>';
  wrap.appendChild(hammer);

  const cylinder = document.createElement('div');
  cylinder.style.cssText =
    'position:absolute;left:0;top:28px;width:' + cylSize + 'px;height:' + cylSize + 'px;border-radius:50%;' +
    'background:radial-gradient(circle at 32% 28%, #d0d4d8 0%, #6a7078 38%, #2a2e34 78%, #121416 100%);' +
    'border:6px solid #1b110a;' +
    'box-shadow:0 18px 40px rgba(0,0,0,0.65), inset 0 0 40px rgba(0,0,0,0.45);' +
    'transition:transform ' + CONFIG.spinDuration + 'ms cubic-bezier(0.2,0.7,0.2,1);transform:rotate(0deg);';

  const hub = document.createElement('div');
  hub.style.cssText =
    'position:absolute;left:50%;top:50%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;' +
    'background:radial-gradient(circle at 35% 30%, #f0c93a, #8a6a18);border:3px solid #1b110a;z-index:4;';
  cylinder.appendChild(hub);

  const n = order.length;
  for (let i = 0; i < n; i++) {
    const person = order[(targetIndex + i) % n];
    const angleDeg = (i / n) * 360;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const cx = cylSize / 2 + radius * Math.cos(rad) - chSize / 2;
    const cy = cylSize / 2 + radius * Math.sin(rad) - chSize / 2;

    const chamber = document.createElement('div');
    chamber.style.cssText =
      'position:absolute;left:' + cx + 'px;top:' + cy + 'px;width:' + chSize + 'px;height:' + chSize + 'px;' +
      'border-radius:50%;background:#121416;border:3px solid #1b110a;' +
      'box-shadow:inset 0 0 12px rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;overflow:hidden;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'width:' + (chSize - 14) + 'px;height:' + (chSize - 14) + 'px;border-radius:50%;object-fit:cover;';
    chamber.appendChild(img);
    cylinder.appendChild(chamber);
  }

  wrap.appendChild(cylinder);
  document.body.appendChild(overlay);

  const spins = 5 + Math.floor(Math.random() * 3);
  setTimeout(() => {
    cylinder.style.transform = 'rotate(' + spins * 360 + 'deg)';
  }, 50);

  setTimeout(() => {
    const bang = document.createElement('div');
    bang.textContent = 'BANG';
    bang.style.cssText =
      'position:absolute;top:46%;left:50%;z-index:20;pointer-events:none;white-space:nowrap;' +
      'transform:translate(-50%,-50%) scale(0.2);' +
      'font-family:"Rye","Times New Roman",serif;font-size:64px;letter-spacing:6px;color:#f6e27a;' +
      'text-shadow:0 0 14px #ff3b30, 4px 4px 0 #1b110a;' +
      'transition:transform 0.28s cubic-bezier(0.34, 1.8, 0.64, 1);';
    wrap.appendChild(bang);

    const flash = document.createElement('div');
    flash.style.cssText =
      'position:absolute;inset:-20px;pointer-events:none;z-index:15;opacity:0;' +
      'background:radial-gradient(circle,rgba(255,204,0,0.55) 0%,rgba(255,59,48,0.32) 32%,transparent 62%);' +
      'transition:opacity 0.12s ease-out;';
    wrap.appendChild(flash);

    requestAnimationFrame(() => {
      bang.style.transform = 'translate(-50%,-50%) scale(1.08) rotate(-6deg)';
      flash.style.opacity = '1';
    });
    setTimeout(() => {
      flash.style.opacity = '0';
    }, 220);
  }, CONFIG.spinDuration);

  setTimeout(() => {
    overlay.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 800);
}
