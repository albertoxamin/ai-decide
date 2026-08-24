import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'torch';
export const label = 'Torch snuff';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    overlay.style.background = 'radial-gradient(ellipse at center, #2a1a0a 0%, #000 100%)';

    const stage = document.createElement('div');
    stage.style.cssText = 'display:flex;gap:22px;padding:30px;flex-wrap:wrap;justify-content:center;max-width:720px;';

    const flickerName = `flameFlicker_${Date.now()}`;
    const styleEl = document.createElement('style');
    styleEl.textContent =
      `@keyframes ${flickerName} { from { transform: scale(1) translateY(0); } to { transform: scale(1.18) translateY(-3px); } }`;
    document.head.appendChild(styleEl);

    // Shuffle visual layout so the winner's torch isn't always at position 0
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    const torchEls = [];
    layout.forEach((orderIdx) => {
      const person = order[orderIdx];
      const col = document.createElement('div');
      col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:11px;font-weight:600;transition:opacity 0.4s,filter 0.4s;';

      const flame = document.createElement('div');
      flame.textContent = '\uD83D\uDD25';
      flame.style.cssText = `font-size:36px;line-height:1;animation:${flickerName} 0.45s ease-in-out infinite alternate;transition:opacity 0.3s, font-size 0.3s, filter 0.3s;`;

      const torch = document.createElement('div');
      torch.style.cssText = 'width:8px;height:60px;background:linear-gradient(180deg,#8b4513,#5a2d0c);border-radius:2px;';

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid #8b4513;transition:border 0.3s, box-shadow 0.3s;';

      const name = document.createElement('span');
      name.textContent = person.name.split(' ')[0].slice(0, 10);

      col.appendChild(flame);
      col.appendChild(torch);
      col.appendChild(img);
      col.appendChild(name);
      stage.appendChild(col);
      torchEls.push({ col, flame, img });
    });

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Random snuff order, excluding the winner (visual indices)
    const snuffOrder = torchEls.map((_, i) => i).filter(i => i !== winnerVisualIdx);
    for (let i = snuffOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [snuffOrder[i], snuffOrder[j]] = [snuffOrder[j], snuffOrder[i]];
    }

    const stepMs = (CONFIG.spinDuration - 800) / Math.max(1, snuffOrder.length);
    snuffOrder.forEach((idx, n) => {
      setTimeout(() => {
        const { flame, img, col } = torchEls[idx];
        flame.textContent = '\uD83D\uDCA8';
        flame.style.animation = 'none';
        flame.style.opacity = '0.4';
        img.style.filter = 'grayscale(1)';
        col.style.opacity = '0.45';
      }, 400 + n * stepMs);
    });

    setTimeout(() => {
      const { flame, img } = torchEls[winnerVisualIdx];
      flame.style.fontSize = '52px';
      flame.style.filter = 'drop-shadow(0 0 14px #ff9500) drop-shadow(0 0 28px #ff3b30)';
      img.style.boxShadow = '0 0 30px rgba(255,149,0,0.8)';
      img.style.border = '3px solid #ff9500';
    }, CONFIG.spinDuration - 250);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Squid Game red light / green light: avatars line up at the bottom and march toward a
   *  finish line at the top while the light is GREEN; they freeze on RED. The doll at the
   *  top turns its head when red. The winner is calibrated to cross the line at the end. */
