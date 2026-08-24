import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'capybara';
export const label = 'Capybara tub';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const w = 560;
    const h = 360;
    const tubW = 460;
    const tubH = 220;
    const tubX = (w - tubW) / 2;
    const tubY = h - tubH - 20;

    const stage = document.createElement('div');
    stage.style.cssText = `position:relative;width:${w}px;height:${h}px;`;

    // Wooden onsen tub (oval, brown)
    const tub = document.createElement('div');
    tub.style.cssText =
      `position:absolute;left:${tubX}px;top:${tubY}px;width:${tubW}px;height:${tubH}px;` +
      'background:linear-gradient(180deg,#8b6f47,#5a3f1f);border:6px solid #4a2f10;' +
      'border-radius:50%;box-shadow:0 10px 18px rgba(0,0,0,0.4),inset 0 4px 8px rgba(0,0,0,0.4);';

    // Steamy water inside
    const water = document.createElement('div');
    water.style.cssText =
      'position:absolute;inset:18px;background:radial-gradient(ellipse at 30% 30%,#bce0ec,#5a9eb5);' +
      'border-radius:50%;box-shadow:inset 0 0 24px rgba(0,0,0,0.3);';
    tub.appendChild(water);
    stage.appendChild(tub);

    // Steam wisps drifting up from the water surface
    const steamAnim = `capySteam_${Date.now()}`;
    const styleEl = document.createElement('style');
    styleEl.textContent =
      `@keyframes ${steamAnim} {` +
      `  0% { transform: translateY(0) scale(1); opacity: 0.65; }` +
      `  100% { transform: translateY(-70px) scale(1.6); opacity: 0; }` +
      `}`;
    document.head.appendChild(styleEl);

    for (let i = 0; i < 7; i++) {
      const steam = document.createElement('div');
      const x = tubX + 40 + Math.random() * (tubW - 80);
      const dur = 2 + Math.random() * 1.2;
      const delay = Math.random() * 2;
      steam.style.cssText =
        `position:absolute;left:${x}px;top:${tubY - 6}px;width:34px;height:34px;` +
        `background:radial-gradient(circle,rgba(255,255,255,0.55),transparent 70%);border-radius:50%;` +
        `animation:${steamAnim} ${dur}s ease-out ${delay}s infinite;pointer-events:none;`;
      stage.appendChild(steam);
    }

    // Capybaras packed inside the water area
    const capySize = 48;
    const padX = 36;
    const padY = 36;
    const cols = Math.max(1, Math.ceil(Math.sqrt(order.length * (tubW / tubH))));
    const rows = Math.ceil(order.length / cols);
    const cellW = (tubW - padX * 2) / cols;
    const cellH = (tubH - padY * 2) / rows;

    // Shuffle visual layout so the winner isn't always the top-left capybara
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    const capyEls = [];
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const col = visualIdx % cols;
      const row = Math.floor(visualIdx / cols);
      const baseX = tubX + padX + col * cellW + cellW / 2 - capySize / 2;
      const baseY = tubY + padY + row * cellH + cellH / 2 - capySize / 2;
      const x = baseX + (Math.random() - 0.5) * 8;
      const y = baseY + (Math.random() - 0.5) * 8;

      const capy = document.createElement('div');
      capy.style.cssText =
        `position:absolute;left:${x}px;top:${y}px;width:${capySize}px;height:${capySize}px;` +
        'display:flex;align-items:center;justify-content:center;z-index:5;' +
        'transition:transform 0.65s cubic-bezier(0.4,0,0.6,1), opacity 0.45s;';

      // Brown capybara body behind the face
      const body = document.createElement('div');
      body.style.cssText = 'position:absolute;inset:-4px;background:linear-gradient(135deg,#8b6f47,#5a3f1f);border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.35);';

      // Two little ear bumps
      const ear1 = document.createElement('div');
      ear1.style.cssText = 'position:absolute;top:-6px;left:8px;width:14px;height:11px;background:#5a3f1f;border-radius:50%;';
      const ear2 = document.createElement('div');
      ear2.style.cssText = 'position:absolute;top:-6px;right:8px;width:14px;height:11px;background:#5a3f1f;border-radius:50%;';

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = `position:relative;width:${capySize - 10}px;height:${capySize - 10}px;border-radius:50%;object-fit:cover;border:2px solid #4a2f10;z-index:1;`;

      capy.appendChild(body);
      capy.appendChild(ear1);
      capy.appendChild(ear2);
      capy.appendChild(img);
      stage.appendChild(capy);
      capyEls.push(capy);
    });

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Non-winner capybaras hop out in a random sequence; each one flies off in a random
    // direction with a tumble. Visual indices, not order indices.
    const exitOrder = capyEls.map((_, i) => i).filter(i => i !== winnerVisualIdx);
    for (let i = exitOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [exitOrder[i], exitOrder[j]] = [exitOrder[j], exitOrder[i]];
    }

    const stepMs = (CONFIG.spinDuration - 800) / Math.max(1, exitOrder.length);
    exitOrder.forEach((idx, n) => {
      setTimeout(() => {
        const capy = capyEls[idx];
        const angle = Math.random() * Math.PI * 2;
        const dist = 420;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 80;
        const spin = (Math.random() - 0.5) * 720;
        capy.style.transform = `translate(${dx}px, ${dy}px) rotate(${spin}deg)`;
        capy.style.opacity = '0';
      }, 350 + n * stepMs);
    });

    setTimeout(() => {
      const winnerCapy = capyEls[winnerVisualIdx];
      winnerCapy.style.transform = 'scale(1.25)';
      winnerCapy.style.zIndex = '20';

      const bubble = document.createElement('div');
      bubble.textContent = 'ahhhh~ \uD83D\uDE0C';
      bubble.style.cssText =
        'position:absolute;background:#fff;color:#222;padding:6px 12px;border-radius:14px;' +
        'font-size:14px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3);' +
        'bottom:100%;left:50%;transform:translateX(-50%) translateY(-10px);white-space:nowrap;' +
        'font-family:"Comic Sans MS",cursive,sans-serif;';
      winnerCapy.appendChild(bubble);
    }, CONFIG.spinDuration - 280);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Tarot reveal: face-down cards with mystic backs are dealt across a velvet table,
   *  then flipped one by one. The winner's card flips last and ignites with a golden
   *  border + arcane title. Decoy cards remain dim once revealed. */
