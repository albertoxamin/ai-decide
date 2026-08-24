import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'bachelor';
export const label = 'Bachelor rose';

/** The Bachelor: contestants in a row, a rose is offered, losers fade,
 *  the winner accepts. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const totalMs = Math.max(CONFIG.spinDuration, 3200);
  const walkMs = Math.max(900, Math.round(totalMs * 0.45));
  const offerMs = Math.max(700, Math.round(totalMs * 0.28));
  const holdMs = Math.max(400, totalMs - walkMs - offerMs);

  const headline = document.createElement('div');
  headline.textContent = 'The Final Rose';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f7c8d4;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 620;
  const stageH = 380;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 50% 20%,#5a1830 0%,#1a0810 70%);' +
    'border:5px solid #8a2040;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Ladies\u2026 gentlemen\u2026';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:14px;text-align:center;z-index:8;' +
    'font-family:"Fraunces",Georgia,serif;font-size:14px;font-style:italic;color:#f7c8d4;' +
    'text-shadow:0 1px 3px #000;';
  stage.appendChild(caption);

  const n = order.length;
  const slotW = Math.min(88, Math.floor((stageW - 40) / n));
  const startX = (stageW - slotW * n) / 2;
  const chips = order.map(function (person, i) {
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:absolute;left:' + (startX + i * slotW) + 'px;bottom:28px;width:' + slotW + 'px;' +
      'display:flex;flex-direction:column;align-items:center;gap:6px;' +
      'transition:filter 0.45s, opacity 0.45s, transform 0.45s;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.style.cssText =
      'width:52px;height:52px;border-radius:50%;object-fit:cover;border:3px solid #f7c8d4;' +
      'transition:box-shadow 0.3s, border-color 0.3s;';
    const nm = document.createElement('div');
    nm.textContent = String(person.name).slice(0, 10);
    nm.style.cssText = 'font-size:11px;color:#f7c8d4;font-weight:700;text-shadow:0 1px 2px #000;';
    wrap.appendChild(img);
    wrap.appendChild(nm);
    stage.appendChild(wrap);
    return { wrap: wrap, img: img, x: startX + i * slotW + slotW / 2 };
  });

  const rose = document.createElement('div');
  rose.textContent = '\uD83C\uDF39';
  const roseStart = chips[0].x;
  rose.style.cssText =
    'position:absolute;left:' + (roseStart - 18) + 'px;top:88px;font-size:36px;z-index:7;' +
    'transition:left 0.55s cubic-bezier(0.4,0.1,0.2,1), top 0.55s cubic-bezier(0.4,0.1,0.2,1), transform 0.4s;' +
    'filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));';
  stage.appendChild(rose);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes roseGlow { 0%,100% { box-shadow:0 0 0 rgba(247,200,212,0); } 50% { box-shadow:0 0 18px rgba(247,200,212,0.9); } }';
  document.head.appendChild(styleEl);

  document.body.appendChild(overlay);

  const visit = order.map(function (_, i) { return i; }).filter(function (i) { return i !== targetIndex; });
  for (let i = visit.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = visit[i];
    visit[i] = visit[j];
    visit[j] = tmp;
  }
  visit.push(targetIndex);
  const step = walkMs / Math.max(1, visit.length);

  visit.forEach(function (idx, nStep) {
    setTimeout(function () {
      const c = chips[idx];
      rose.style.left = c.x - 18 + 'px';
      caption.textContent = order[idx].name + '\u2026';
      chips.forEach(function (ch, i) {
        ch.img.style.borderColor = i === idx ? '#fff' : '#f7c8d4';
      });
    }, nStep * step);
  });

  setTimeout(function () {
    const c = chips[targetIndex];
    rose.style.top = '210px';
    rose.style.transform = 'scale(1.25)';
    caption.textContent = 'Will you accept this rose?';
    chips.forEach(function (ch, i) {
      if (i === targetIndex) {
        ch.wrap.style.transform = 'translateY(-10px) scale(1.12)';
        ch.img.style.borderColor = '#ff4d6d';
        ch.img.style.animation = 'roseGlow 0.8s ease-in-out infinite';
      } else {
        ch.wrap.style.filter = 'grayscale(1)';
        ch.wrap.style.opacity = '0.35';
      }
    });
  }, walkMs);

  setTimeout(function () {
    caption.textContent = winner.name + ' said yes';
  }, walkMs + offerMs * 0.5);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, walkMs + offerMs + holdMs);
}
