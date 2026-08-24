import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'sortinghat';
export const label = 'Sorting hat';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const avatarSize = 60;
    const gap = 12;
    const totalW = order.length * (avatarSize + gap) - gap;
    const stageW = Math.max(totalW + 40, 480);
    const stageH = 280;
    const avatarY = 200;
    const startX = (stageW - totalW) / 2;

    const stage = document.createElement('div');
    stage.style.cssText = `position:relative;width:${stageW}px;height:${stageH}px;`;

    // Shuffle visual layout so the hat can land anywhere along the row
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    const avatarEls = [];
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const wrap = document.createElement('div');
      const x = startX + visualIdx * (avatarSize + gap);
      wrap.style.cssText =
        `position:absolute;left:${x}px;top:${avatarY}px;width:${avatarSize}px;` +
        'display:flex;flex-direction:column;align-items:center;gap:4px;' +
        'color:#fff;font-size:11px;font-weight:600;transition:filter 0.3s;';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = `width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;object-fit:cover;border:2px solid #555;transition:border 0.3s, box-shadow 0.3s;`;
      const name = document.createElement('span');
      name.textContent = person.name.split(' ')[0].slice(0, 10);
      wrap.appendChild(img);
      wrap.appendChild(name);
      stage.appendChild(wrap);
      avatarEls.push({ wrap, img, x });
    });

    const hat = document.createElement('div');
    hat.textContent = '\uD83C\uDFA9';
    hat.style.cssText =
      `position:absolute;left:0;top:0;font-size:64px;line-height:1;z-index:10;` +
      'transition:left 0.32s cubic-bezier(0.4, 0, 0.6, 1), top 0.32s cubic-bezier(0.4, 0, 0.6, 1), transform 0.3s;';
    stage.appendChild(hat);

    const bubble = document.createElement('div');
    bubble.style.cssText =
      'position:absolute;background:#fff;color:#222;padding:6px 14px;border-radius:14px;' +
      'font-size:13px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3);' +
      'opacity:0;transition:opacity 0.2s,left 0.32s,top 0.32s,background 0.2s;z-index:11;font-family:Georgia,serif;';
    stage.appendChild(bubble);

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    const mumbles = ['Hmm...', 'Maybe?', 'Interesting...', 'Tricky...', 'Could be...', 'Almost...', 'Hmm hmm...'];
    const hopCount = Math.min(order.length + 2, 8);
    const hops = [];
    for (let h = 0; h < hopCount - 1; h++) {
      hops.push(Math.floor(Math.random() * order.length));
    }
    hops.push(winnerVisualIdx);

    const hopMs = (CONFIG.spinDuration - 200) / hops.length;

    // Position hat over the first stop instantly so the first transition is visible.
    hat.style.left = `${avatarEls[hops[0]].x + avatarSize / 2 - 32}px`;
    hat.style.top = '40px';

    hops.forEach((avatarIdx, h) => {
      const isLast = h === hops.length - 1;
      setTimeout(() => {
        const ax = avatarEls[avatarIdx].x;
        hat.style.left = `${ax + avatarSize / 2 - 32}px`;
        hat.style.top = isLast ? `${avatarY - 38}px` : '40px';

        bubble.textContent = isLast ? 'STANDUP!' : mumbles[Math.floor(Math.random() * mumbles.length)];
        bubble.style.left = `${ax + avatarSize / 2 - 32}px`;
        bubble.style.top = '0px';
        bubble.style.opacity = '1';

        if (isLast) {
          bubble.style.background = '#ffcc00';
          bubble.style.color = '#222';
          bubble.style.fontSize = '16px';
          avatarEls[avatarIdx].img.style.boxShadow = '0 0 30px rgba(255,204,0,0.8)';
          avatarEls[avatarIdx].img.style.border = '3px solid #ffcc00';
          avatarEls.forEach(({ wrap }, i) => {
            if (i !== avatarIdx) wrap.style.filter = 'grayscale(1) opacity(0.4)';
          });
        }
      }, h * hopMs);
    });

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Survivor torch snuff: each participant has a lit torch; torches snuff out one by one
   *  in a random order, leaving only the winner's torch burning at the end. */
