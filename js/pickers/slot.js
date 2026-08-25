import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'slot';
export const label = 'Slot machine';

function uid() {
  return 'slot_' + Math.random().toString(36).slice(2, 9);
}

/** Carnival one-arm bandit: three reels lock onto the same face. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #3a1020 0%, #0c0408 72%)';
  const winner = order[targetIndex];
  const ns = uid();
  const totalMs = CONFIG.spinDuration;
  const lastStop = Math.max(1100, totalMs - 450);
  const stopDelays = [lastStop * 0.38, lastStop * 0.68, lastStop];

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + ns + '_bulb { 0%,49% { opacity:1 } 50%,100% { opacity:0.28 } }';
  document.head.appendChild(styleEl);

  const headline = document.createElement('div');
  headline.textContent = 'One-Armed Bandit';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const machine = document.createElement('div');
  machine.style.cssText =
    'position:relative;width:460px;padding:28px 28px 22px 28px;' +
    'background:linear-gradient(180deg,#8a1a28 0%,#5a1018 55%,#3a0c10 100%);' +
    'border:6px solid #1b110a;border-radius:14px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.75), inset 0 0 0 5px #d4af37;';
  overlay.appendChild(machine);

  for (let i = 0; i < 11; i++) {
    const bulb = document.createElement('div');
    bulb.style.cssText =
      'position:absolute;top:-8px;left:' + (18 + i * 38) + 'px;width:12px;height:12px;' +
      'border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff5d6,#d99a2b 70%);' +
      'border:2px solid #1b110a;animation:' + ns + '_bulb 0.9s steps(1) ' + (i * 70) + 'ms infinite;';
    machine.appendChild(bulb);
  }

  const jackpot = document.createElement('div');
  jackpot.textContent = 'JACKPOT';
  jackpot.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:18px;letter-spacing:6px;' +
    'color:#f6e27a;text-align:center;text-shadow:0 2px 0 #1b110a;margin-bottom:14px;';
  machine.appendChild(jackpot);

  const reelsRow = document.createElement('div');
  reelsRow.style.cssText =
    'display:flex;gap:10px;background:#1b110a;padding:12px;border-radius:8px;' +
    'border:3px solid #d4af37;';
  machine.appendChild(reelsRow);

  const reelW = 118;
  const slotH = 118;
  const stripLen = 28;

  for (let r = 0; r < 3; r++) {
    const reelWindow = document.createElement('div');
    reelWindow.style.cssText =
      'width:' + reelW + 'px;height:' + slotH + 'px;overflow:hidden;position:relative;' +
      'background:#fbf4dd;border:3px solid #1b110a;border-radius:4px;';

    const reel = document.createElement('div');
    reel.style.cssText = 'position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;';

    const strip = [];
    for (let i = 0; i < stripLen; i++) {
      strip.push(order[Math.floor(Math.random() * order.length)]);
    }
    strip[stripLen - 1] = winner;

    strip.forEach((p) => {
      const slot = document.createElement('div');
      slot.style.cssText =
        'flex-shrink:0;height:' + slotH + 'px;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:6px;' +
        'border-bottom:2px dashed #d4af37;background:#fbf4dd;';
      const img = document.createElement('img');
      img.src = p.avatarUrl;
      img.alt = '';
      img.style.cssText =
        'width:58px;height:58px;border-radius:50%;object-fit:cover;border:3px solid #1b110a;';
      const name = document.createElement('span');
      name.textContent = p.name.split(' ')[0].slice(0, 10);
      name.style.cssText =
        'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#1b110a;letter-spacing:0.4px;';
      slot.appendChild(img);
      slot.appendChild(name);
      reel.appendChild(slot);
    });

    reelWindow.appendChild(reel);
    reelsRow.appendChild(reelWindow);

    const finalTop = -((stripLen - 1) * slotH);
    setTimeout(() => {
      reel.style.transition = 'top ' + stopDelays[r] + 'ms cubic-bezier(0.25, 0.1, 0.2, 1)';
      reel.style.top = finalTop + 'px';
    }, 50);
  }

  const lever = document.createElement('div');
  lever.style.cssText =
    'position:absolute;right:-28px;top:88px;width:22px;height:120px;' +
    'background:linear-gradient(90deg,#c9ced4,#5a6068);border:3px solid #1b110a;border-radius:8px;';
  const knob = document.createElement('div');
  knob.style.cssText =
    'position:absolute;top:-18px;left:-8px;width:34px;height:34px;border-radius:50%;' +
    'background:radial-gradient(circle at 35% 30%,#ff6a5a,#c83a1e);border:3px solid #1b110a;';
  lever.appendChild(knob);
  machine.appendChild(lever);

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, totalMs + 140);
}
