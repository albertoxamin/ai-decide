import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'captcha';
export const label = 'Captcha';

/** Fake reCAPTCHA: tiles shuffle, then the squares matching the winner stay checked. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const totalMs = Math.max(CONFIG.spinDuration, 2800);
  const cycleMs = Math.max(900, Math.round(totalMs * 0.5));
  const lockMs = Math.max(600, Math.round(totalMs * 0.28));
  const holdMs = Math.max(350, totalMs - cycleMs - lockMs);

  const card = document.createElement('div');
  card.style.cssText =
    'width:340px;background:#fff;border-radius:2px;overflow:hidden;color:#202124;' +
    'font-family:Arial,Helvetica,sans-serif;box-shadow:0 24px 50px rgba(0,0,0,0.55);';
  overlay.appendChild(card);

  const header = document.createElement('div');
  header.style.cssText = 'background:#1a73e8;color:#fff;padding:18px 20px 16px;';
  const prompt = document.createElement('div');
  prompt.style.cssText = 'font-size:13px;opacity:0.9;';
  prompt.textContent = 'Select all squares with';
  const promptName = document.createElement('div');
  promptName.style.cssText = 'font-size:26px;font-weight:700;margin-top:4px;min-height:32px;';
  promptName.textContent = order[0].name;
  header.appendChild(prompt);
  header.appendChild(promptName);
  card.appendChild(header);

  const grid = document.createElement('div');
  grid.style.cssText =
    'display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:8px;background:#fff;';
  card.appendChild(grid);

  const tiles = [];
  for (let i = 0; i < 9; i++) {
    const person = order[i % order.length];
    const cell = document.createElement('div');
    cell.style.cssText =
      'position:relative;aspect-ratio:1;overflow:hidden;background:#e8eaed;cursor:default;' +
      'outline:3px solid transparent;transition:outline-color 0.2s, filter 0.35s, opacity 0.35s;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    cell.appendChild(img);
    const check = document.createElement('div');
    check.textContent = '\u2713';
    check.style.cssText =
      'position:absolute;top:4px;left:4px;width:22px;height:22px;border-radius:2px;' +
      'background:#1a73e8;color:#fff;font-size:14px;font-weight:700;display:none;' +
      'align-items:center;justify-content:center;';
    cell.appendChild(check);
    grid.appendChild(cell);
    tiles.push({ cell: cell, img: img, check: check, personIndex: i % order.length });
  }

  const footer = document.createElement('div');
  footer.style.cssText =
    'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-top:1px solid #dadce0;';
  const robot = document.createElement('div');
  robot.style.cssText = 'display:flex;align-items:center;gap:10px;font-size:13px;color:#5f6368;';
  const box = document.createElement('div');
  box.style.cssText =
    'width:22px;height:22px;border:2px solid #5f6368;border-radius:2px;background:#fff;' +
    'display:flex;align-items:center;justify-content:center;font-size:16px;color:#1a73e8;';
  robot.appendChild(box);
  const robotLbl = document.createElement('span');
  robotLbl.textContent = "I'm not a robot";
  robot.appendChild(robotLbl);
  footer.appendChild(robot);
  const verify = document.createElement('div');
  verify.textContent = 'VERIFY';
  verify.style.cssText =
    'background:#1a73e8;color:#fff;font-size:12px;font-weight:700;letter-spacing:1px;' +
    'padding:8px 14px;border-radius:2px;opacity:0.45;';
  footer.appendChild(verify);
  card.appendChild(footer);

  document.body.appendChild(overlay);

  let tick = 0;
  const iv = setInterval(function () {
    const p = order[tick % order.length];
    promptName.textContent = p.name;
    tiles.forEach(function (t, i) {
      const idx = (tick + i) % order.length;
      t.img.src = order[idx].avatarUrl;
      t.personIndex = idx;
      t.cell.style.outlineColor = idx === tick % order.length ? '#1a73e8' : 'transparent';
    });
    tick++;
  }, 140);

  setTimeout(function () {
    clearInterval(iv);
    promptName.textContent = winner.name;
    tiles.forEach(function (t, i) {
      const isHit = t.personIndex === targetIndex || (i === 4);
      if (i === 4) {
        t.img.src = winner.avatarUrl;
        t.personIndex = targetIndex;
      }
      if (t.personIndex === targetIndex) {
        t.check.style.display = 'flex';
        t.cell.style.outlineColor = '#1a73e8';
      } else {
        t.cell.style.filter = 'grayscale(1)';
        t.cell.style.opacity = '0.4';
        t.cell.style.outlineColor = 'transparent';
      }
    });
    box.textContent = '\u2713';
    box.style.borderColor = '#1a73e8';
    verify.style.opacity = '1';
  }, cycleMs);

  setTimeout(function () {
    overlay.remove();
    revealWinner(order, targetIndex);
  }, cycleMs + lockMs + holdMs);
}
