import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'amongus';
export const label = 'Among Us eject';

/** Emergency meeting, then the winner is ejected through the airlock. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const totalMs = Math.max(CONFIG.spinDuration, 3400);
  const meetMs = Math.max(900, Math.round(totalMs * 0.32));
  const ejectMs = Math.max(1100, Math.round(totalMs * 0.42));
  const holdMs = Math.max(400, totalMs - meetMs - ejectMs);

  const headline = document.createElement('div');
  headline.textContent = 'Emergency Meeting';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:22px;letter-spacing:2px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 620;
  const stageH = 380;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:#070b16;border:5px solid #1b110a;border-radius:12px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  for (let i = 0; i < 40; i++) {
    const star = document.createElement('div');
    star.style.cssText =
      'position:absolute;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;' +
      'width:' + (1 + Math.random() * 2) + 'px;height:' + (1 + Math.random() * 2) + 'px;' +
      'background:#fff;border-radius:50%;opacity:' + (0.3 + Math.random() * 0.7) + ';';
    stage.appendChild(star);
  }

  const caption = document.createElement('div');
  caption.textContent = 'Who is the impostor?';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:14px;text-align:center;z-index:8;' +
    'font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:800;color:#fff;' +
    'text-shadow:0 2px 0 #000;';
  stage.appendChild(caption);

  const hatch = document.createElement('div');
  hatch.style.cssText =
    'position:absolute;right:36px;top:70px;width:70px;height:220px;border-radius:12px;' +
    'background:linear-gradient(90deg,#3a3a48,#1a1a22);border:4px solid #888;' +
    'box-shadow:inset 0 0 20px #000;z-index:2;transition:background 0.4s, box-shadow 0.4s;';
  stage.appendChild(hatch);

  const n = order.length;
  const crew = order.map(function (person, i) {
    const wrap = document.createElement('div');
    const y = 80 + (i % 5) * 52;
    const x = 40 + Math.floor(i / 5) * 70;
    wrap.style.cssText =
      'position:absolute;left:' + x + 'px;top:' + y + 'px;width:56px;' +
      'display:flex;flex-direction:column;align-items:center;gap:3px;z-index:4;' +
      'transition:left 1.1s cubic-bezier(0.4,0,0.7,1), top 1.1s cubic-bezier(0.4,0,0.7,1), opacity 0.4s, filter 0.4s, transform 1.1s;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.style.cssText =
      'width:44px;height:44px;border-radius:12px 12px 40% 40%;object-fit:cover;border:3px solid #fff;';
    const visor = document.createElement('div');
    visor.style.cssText =
      'position:absolute;top:10px;left:18px;width:22px;height:14px;border-radius:8px;' +
      'background:linear-gradient(180deg,#cfefff,#6ab0d8);border:1px solid #fff;pointer-events:none;';
    wrap.appendChild(img);
    wrap.appendChild(visor);
    stage.appendChild(wrap);
    return { wrap: wrap, img: img };
  });

  document.body.appendChild(overlay);

  const voteIv = setInterval(function () {
    const p = order[Math.floor(Math.random() * order.length)];
    caption.textContent = p.name + ' voted';
  }, 180);

  setTimeout(function () {
    clearInterval(voteIv);
    caption.textContent = winner.name + ' was ejected.';
    hatch.style.background = 'linear-gradient(90deg,#0a1020,#000)';
    hatch.style.boxShadow = 'inset 0 0 30px #4af, 0 0 24px #4af';
    const w = crew[targetIndex];
    w.wrap.style.left = stageW - 40 + 'px';
    w.wrap.style.top = '140px';
    w.wrap.style.transform = 'rotate(120deg) scale(0.7)';
    w.wrap.style.zIndex = '6';
    crew.forEach(function (c, i) {
      if (i !== targetIndex) {
        c.wrap.style.filter = 'grayscale(0.4)';
        c.wrap.style.opacity = '0.7';
      }
    });
  }, meetMs);

  setTimeout(function () {
    const w = crew[targetIndex];
    w.wrap.style.left = stageW + 40 + 'px';
    w.wrap.style.opacity = '1';
    caption.textContent = winner.name + ' was not The Impostor.';
  }, meetMs + ejectMs * 0.55);

  setTimeout(function () {
    overlay.remove();
    revealWinner(order, targetIndex);
  }, meetMs + ejectMs + holdMs);
}
