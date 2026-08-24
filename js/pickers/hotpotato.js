import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'hotpotato';
export const label = 'Hot potato';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    // Hot potato wants enough hops to feel suspenseful — extend past the default if needed.
    const potatoDuration = Math.max(CONFIG.spinDuration, 4500);

    const stageSize = 460;
    const radius = stageSize / 2 - 60;
    const cx = stageSize / 2;
    const cy = stageSize / 2;
    const avatarSize = 56;
    const potatoSize = 54;

    const stage = document.createElement('div');
    stage.style.cssText =
      `position:relative;width:${stageSize}px;height:${stageSize}px;` +
      'background:radial-gradient(circle at 50% 50%,#3a2a1e 0%,#1a0e08 75%);border-radius:50%;' +
      'border:4px solid #5a3f1f;box-shadow:0 0 40px rgba(255,140,40,0.35),inset 0 0 40px rgba(0,0,0,0.6);';

    // Shuffle the layout so the winner can land at any angular position
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);
    const n = layout.length;

    const avatarPositions = [];
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const angle = (visualIdx / n) * Math.PI * 2 - Math.PI / 2;
      const ax = cx + radius * Math.cos(angle) - avatarSize / 2;
      const ay = cy + radius * Math.sin(angle) - avatarSize / 2;

      const wrap = document.createElement('div');
      wrap.style.cssText =
        `position:absolute;left:${ax}px;top:${ay}px;width:${avatarSize}px;` +
        'display:flex;flex-direction:column;align-items:center;gap:3px;' +
        'transition:transform 0.25s, filter 0.5s;color:#fff;font-size:10px;font-weight:600;';

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText =
        `width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;object-fit:cover;` +
        'border:3px solid #555;transition:border 0.25s, box-shadow 0.25s, transform 0.25s;';

      const name = document.createElement('span');
      name.textContent = person.name.split(' ')[0].slice(0, 9);
      name.style.cssText = 'text-shadow:0 1px 2px rgba(0,0,0,0.7);';

      wrap.appendChild(img);
      wrap.appendChild(name);
      stage.appendChild(wrap);
      avatarPositions.push({ wrap, img, x: ax + avatarSize / 2, y: ay + avatarSize / 2 });
    });

    // Glowing potato
    const potato = document.createElement('div');
    potato.textContent = '\uD83E\uDD54';
    potato.style.cssText =
      `position:absolute;left:${cx - potatoSize / 2}px;top:${cy - potatoSize / 2}px;` +
      `width:${potatoSize}px;height:${potatoSize}px;font-size:${potatoSize - 6}px;line-height:1;` +
      'display:flex;align-items:center;justify-content:center;z-index:10;' +
      'transition:left 0.28s cubic-bezier(0.4,0,0.6,1), top 0.28s cubic-bezier(0.4,0,0.6,1), transform 0.28s;' +
      'filter:drop-shadow(0 0 12px rgba(255,140,40,0.85));';
    stage.appendChild(potato);

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Build a hop schedule that starts slow, speeds up in the middle, then dramatically
    // slows down before landing on the winner so the suspense really builds.
    const totalMs = potatoDuration - 600;
    const hops = [];
    let t = 0;
    let cur = Math.floor(Math.random() * n);
    while (t < totalMs - 600) {
      const progress = t / totalMs;
      // Speed curve: slow start (~260ms), fast middle (~140ms), very slow tail (~360ms)
      let speedFactor;
      if (progress < 0.5) {
        speedFactor = 1.4 - progress * 1.6; // 1.4 -> 0.6
      } else {
        speedFactor = 0.6 + (progress - 0.5) * 2.4; // 0.6 -> 1.8
      }
      const dt = 180 * speedFactor + Math.random() * 40;
      let next;
      if (Math.random() < 0.7) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        next = (cur + dir + n) % n;
      } else {
        next = Math.floor(Math.random() * n);
        if (next === cur) next = (next + 1) % n;
      }
      hops.push({ at: t, idx: next });
      cur = next;
      t += dt;
    }
    // Penultimate hop: a deliberate "almost..." hover on a non-winner near the end.
    let teaseIdx = Math.floor(Math.random() * n);
    if (teaseIdx === winnerVisualIdx) teaseIdx = (teaseIdx + 1) % n;
    hops.push({ at: totalMs - 350, idx: teaseIdx });
    // Final hop locks on the winner.
    hops.push({ at: totalMs, idx: winnerVisualIdx });

    let lastHighlighted = null;
    hops.forEach((hop, i) => {
      const isLast = i === hops.length - 1;
      setTimeout(() => {
        const target = avatarPositions[hop.idx];
        potato.style.left = `${target.x - potatoSize / 2}px`;
        potato.style.top = `${target.y - potatoSize / 2 - 8}px`;
        potato.style.transform = `rotate(${(Math.random() - 0.5) * 40}deg) scale(${isLast ? 1.4 : 1.0})`;

        if (lastHighlighted !== null && lastHighlighted !== hop.idx) {
          const prev = avatarPositions[lastHighlighted];
          prev.img.style.border = '3px solid #555';
          prev.img.style.boxShadow = 'none';
          prev.img.style.transform = 'scale(1)';
        }
        const cur2 = avatarPositions[hop.idx];
        cur2.img.style.border = isLast ? '4px solid #ffcc00' : '3px solid #ff8c28';
        cur2.img.style.boxShadow = isLast
          ? '0 0 28px rgba(255,204,0,0.95)'
          : '0 0 14px rgba(255,140,40,0.7)';
        cur2.img.style.transform = isLast ? 'scale(1.18)' : 'scale(1.06)';
        lastHighlighted = hop.idx;
      }, hop.at);
    });

    // Boom! at the end: confetti + scorched effect on the winner; others fade.
    setTimeout(() => {
      potato.style.transition = 'transform 0.4s, opacity 0.4s';
      potato.style.transform = 'scale(2.4)';
      potato.style.opacity = '0';

      const winnerPos = avatarPositions[winnerVisualIdx];
      // Confetti burst
      for (let i = 0; i < 18; i++) {
        const piece = document.createElement('div');
        const angle = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 90;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const colors = ['#ff3b30', '#ffcc00', '#34c759', '#007aff', '#ff9500', '#af52de'];
        piece.style.cssText =
          `position:absolute;left:${winnerPos.x - 4}px;top:${winnerPos.y - 4}px;width:8px;height:8px;` +
          `background:${colors[i % colors.length]};border-radius:2px;z-index:11;` +
          'transition:transform 0.7s cubic-bezier(0.2,0.7,0.4,1), opacity 0.7s;pointer-events:none;';
        stage.appendChild(piece);
        requestAnimationFrame(() => {
          piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${Math.random() * 720}deg)`;
          piece.style.opacity = '0';
        });
      }
      avatarPositions.forEach(({ wrap }, i) => {
        if (i !== winnerVisualIdx) wrap.style.filter = 'grayscale(1) brightness(0.4)';
      });
    }, totalMs + 200);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, potatoDuration + 100);
  }

  /** Blackjack table: dealer at the top, players seated around a green felt arc. Cards are
   *  dealt face-down to each player, then flipped one by one to reveal their hand value.
   *  All non-winners bust or stand low; the winner reveals BLACKJACK (21) with a gold halo. */
