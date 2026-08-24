import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'domino';
export const label = 'Domino chain';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    // Shuffle visual order so the winner appears at a random column
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    const dominoW = 54;
    const dominoH = 110;
    const gap = 10;
    const totalW = layout.length * (dominoW + gap) - gap;

    const stage = document.createElement('div');
    stage.style.cssText =
      `position:relative;width:${totalW}px;height:${dominoH + 30}px;` +
      'display:flex;align-items:flex-end;padding-bottom:20px;' +
      'border-bottom:3px solid #555;background:linear-gradient(180deg,transparent 70%,rgba(255,255,255,0.04));';

    const dominos = [];
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const dom = document.createElement('div');
      dom.style.cssText =
        `position:relative;width:${dominoW}px;height:${dominoH}px;flex-shrink:0;` +
        'background:linear-gradient(135deg,#f0f0f0,#aaa);border:1.5px solid #333;border-radius:5px;' +
        `margin-right:${visualIdx === layout.length - 1 ? 0 : gap}px;` +
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;' +
        'color:#222;font-size:9px;font-weight:700;' +
        'transform-origin:bottom right;' +
        'transition:transform 0.28s cubic-bezier(0.5, 0.1, 0.7, 1), background 0.3s, color 0.3s, box-shadow 0.3s;' +
        'box-shadow:2px 2px 4px rgba(0,0,0,0.35);';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid #555;';
      const name = document.createElement('span');
      name.textContent = person.name.split(' ')[0].slice(0, 8);
      dom.appendChild(img);
      dom.appendChild(name);
      stage.appendChild(dom);
      dominos.push(dom);
    });

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Knock dominoes from left up to (but not including) the winner.
    const fallable = Math.max(1, winnerVisualIdx);
    const stepMs = Math.min(160, (CONFIG.spinDuration - 800) / fallable);
    for (let i = 0; i < winnerVisualIdx; i++) {
      setTimeout(() => {
        dominos[i].style.transform = 'rotate(90deg)';
      }, 250 + i * stepMs);
    }

    // After the chain stops at the winner, glow the winner's domino.
    setTimeout(() => {
      const w = dominos[winnerVisualIdx];
      w.style.background = 'linear-gradient(135deg,#34c759,#22a045)';
      w.style.color = '#fff';
      w.style.boxShadow = '0 0 24px rgba(52,199,89,0.8), 2px 2px 4px rgba(0,0,0,0.35)';
      w.style.transform = 'translateY(-10px)';
    }, 350 + winnerVisualIdx * stepMs);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Sorting Hat: a wizard hat hovers over the avatars, hops between random ones with
   *  "Hmm..." mumbles, and finally lands on the winner with "STANDUP!". */
