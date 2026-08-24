import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'lightning';
export const label = 'Lightning';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const dimBg = 'radial-gradient(ellipse at center, #1a1a2e 0%, #000 100%)';
    overlay.style.background = dimBg;

    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;display:flex;gap:14px;padding:80px 30px 40px;flex-wrap:wrap;justify-content:center;max-width:720px;';

    // Shuffle visual layout so the winner can be struck at any column
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    const avatarEls = [];
    layout.forEach((orderIdx) => {
      const person = order[orderIdx];
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:11px;font-weight:600;transition:opacity 0.4s,filter 0.3s,transform 0.3s;';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid #555;transition:border 0.2s,box-shadow 0.2s;';
      const name = document.createElement('span');
      name.textContent = person.name.split(' ')[0].slice(0, 10);
      wrap.appendChild(img);
      wrap.appendChild(name);
      stage.appendChild(wrap);
      avatarEls.push({ wrap, img });
    });

    const clouds = document.createElement('div');
    clouds.textContent = '\u2601\uFE0F\u2601\uFE0F\uD83C\uDF29\uFE0F\u2601\uFE0F\u2601\uFE0F';
    clouds.style.cssText = 'position:absolute;top:30px;left:50%;transform:translateX(-50%);font-size:60px;letter-spacing:-12px;';
    overlay.appendChild(clouds);

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    const flash = (color, duration) => {
      overlay.style.background = `radial-gradient(ellipse at center, ${color} 0%, #000 100%)`;
      setTimeout(() => { overlay.style.background = dimBg; }, duration);
    };

    setTimeout(() => flash('#3a3a8a', 90), 600);
    setTimeout(() => flash('#5a5a9a', 90), 1200);
    setTimeout(() => flash('#3a3a8a', 90), 1700);

    setTimeout(() => {
      const winnerEl = avatarEls[winnerVisualIdx];
      const winnerRect = winnerEl.wrap.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const targetX = winnerRect.left - overlayRect.left + winnerRect.width / 2;

      const bolt = document.createElement('div');
      bolt.style.cssText =
        `position:absolute;left:${targetX - 30}px;top:90px;width:60px;height:${winnerRect.top - overlayRect.top - 60}px;` +
        'pointer-events:none;z-index:10;';
      bolt.innerHTML =
        '<svg width="100%" height="100%" viewBox="0 0 60 300" preserveAspectRatio="none">' +
        '<polygon points="35,0 12,140 28,140 18,300 50,130 32,130 45,0" ' +
        'fill="#ffffff" stroke="#ffff66" stroke-width="2" ' +
        'style="filter:drop-shadow(0 0 12px #ffff00) drop-shadow(0 0 24px #ffaa00);" />' +
        '</svg>';
      overlay.appendChild(bolt);

      overlay.style.background = '#fff';
      setTimeout(() => { overlay.style.background = dimBg; }, 110);

      avatarEls.forEach(({ wrap, img }, i) => {
        if (i === winnerVisualIdx) {
          img.style.border = '3px solid #ffff00';
          img.style.boxShadow = '0 0 30px #ffff00, 0 0 60px #ff9500';
          wrap.style.transform = 'scale(1.15)';
        } else {
          wrap.style.opacity = '0.25';
        }
      });
    }, 2200);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Domino chain: a row of dominoes (avatars + names) tip in sequence from the left. The
   *  winner's domino is the wall that stops the chain — everything left of them falls,
   *  the winner stays standing and lights up green, everything right is untouched. */
