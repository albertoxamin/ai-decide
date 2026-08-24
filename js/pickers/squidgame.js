import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'squidgame';
export const label = 'Squid Game';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const w = 720;
    const h = 420;
    const finishY = 70;
    const startY = h - 80;

    const field = document.createElement('div');
    field.style.cssText =
      `position:relative;width:${w}px;height:${h}px;background:linear-gradient(180deg,#d4a373 0%,#c08a5a 100%);` +
      `border:3px solid #333;border-radius:10px;overflow:hidden;`;

    const doll = document.createElement('div');
    doll.textContent = '\uD83D\uDC67';
    doll.style.cssText = `position:absolute;top:6px;left:50%;transform:translateX(-50%) rotateY(180deg);font-size:80px;line-height:1;transition:transform 0.4s ease-in-out;z-index:5;`;
    field.appendChild(doll);

    const fLine = document.createElement('div');
    fLine.style.cssText = `position:absolute;top:${finishY}px;left:0;right:0;height:5px;background:repeating-linear-gradient(90deg,#fff 0,#fff 14px,#000 14px,#000 28px);z-index:1;`;
    field.appendChild(fLine);

    const light = document.createElement('div');
    light.style.cssText =
      `position:absolute;top:96px;left:50%;transform:translateX(-50%);background:#34c759;color:#fff;` +
      `padding:6px 18px;border-radius:20px;font-weight:800;font-size:13px;letter-spacing:2px;z-index:6;` +
      `box-shadow:0 0 12px rgba(0,0,0,0.4);transition:background 0.12s;`;
    light.textContent = 'GREEN LIGHT';
    field.appendChild(light);

    const playerW = 38;
    const gap = 14;
    const totalW = order.length * (playerW + gap) - gap;
    const playerStartX = (w - totalW) / 2;

    // Shuffle which lane each player runs in so the winner isn't always the leftmost
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    const playerEls = [];
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const player = document.createElement('div');
      const x = playerStartX + visualIdx * (playerW + gap);
      player.style.cssText =
        `position:absolute;left:${x}px;top:${startY}px;width:${playerW}px;display:flex;flex-direction:column;align-items:center;gap:2px;` +
        `transition:top 0.4s linear, opacity 0.3s;color:#fff;font-size:9px;font-weight:700;text-shadow:0 1px 2px rgba(0,0,0,0.6);`;
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = `width:${playerW}px;height:${playerW}px;border-radius:50%;object-fit:cover;border:2px solid #fff;transition:border 0.3s, box-shadow 0.3s;`;
      const name = document.createElement('span');
      name.textContent = person.name.split(' ')[0].slice(0, 7);
      player.appendChild(img);
      player.appendChild(name);
      field.appendChild(player);
      playerEls.push({ player, img, currentY: startY });
    });

    overlay.appendChild(field);
    document.body.appendChild(overlay);

    const phases = [
      { state: 'green', dur: 800 },
      { state: 'red',   dur: 400 },
      { state: 'green', dur: 700 },
      { state: 'red',   dur: 350 },
      { state: 'green', dur: 750 },
    ];
    const totalDistance = startY - finishY - 8;
    const totalGreenMs = phases.filter(p => p.state === 'green').reduce((s, p) => s + p.dur, 0);
    const playerSpeeds = playerEls.map((_, i) =>
      i === winnerVisualIdx
        ? totalDistance / totalGreenMs
        : (totalDistance * (0.6 + Math.random() * 0.32)) / totalGreenMs
    );

    let elapsed = 80;
    phases.forEach((phase) => {
      const start = elapsed;
      setTimeout(() => {
        light.textContent = phase.state === 'green' ? 'GREEN LIGHT' : 'RED LIGHT';
        light.style.background = phase.state === 'green' ? '#34c759' : '#ff3b30';
        doll.style.transform = phase.state === 'green'
          ? 'translateX(-50%) rotateY(180deg)'
          : 'translateX(-50%) rotateY(0deg)';

        if (phase.state === 'green') {
          playerEls.forEach((p, i) => {
            p.currentY = Math.max(finishY, p.currentY - playerSpeeds[i] * phase.dur);
            p.player.style.transition = `top ${phase.dur}ms linear`;
            p.player.style.top = `${p.currentY}px`;
          });
        } else {
          playerEls.forEach(p => { p.player.style.transition = 'top 0.08s'; });
        }
      }, start);
      elapsed += phase.dur;
    });

    setTimeout(() => {
      playerEls[winnerVisualIdx].img.style.boxShadow = '0 0 22px #ffcc00, 0 0 40px #ff9500';
      playerEls[winnerVisualIdx].img.style.border = '3px solid #ffcc00';
      playerEls.forEach((p, i) => {
        if (i !== winnerVisualIdx) p.player.style.opacity = '0.4';
      });
    }, elapsed - 100);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Capybara onsen: a wooden hot tub full of avatar-faced capybaras with little ears.
   *  Steam wafts up; non-winner capybaras hop out of the tub one by one in random
   *  directions; the winner stays soaking with a contented "ahhhh~" speech bubble. */
