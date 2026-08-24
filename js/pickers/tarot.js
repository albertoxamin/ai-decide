import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'tarot';
export const label = 'Tarot reveal';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    // Tarot benefits from a slower, more theatrical pace than the default.
    const tarotDuration = Math.max(CONFIG.spinDuration, 5500);

    const cardW = 100;
    const cardH = 160;
    const gap = 14;
    const maxCards = Math.min(order.length, 6);
    const stageW = maxCards * cardW + (maxCards - 1) * gap + 60;
    const stageH = cardH + 110;

    const stage = document.createElement('div');
    stage.style.cssText =
      `position:relative;width:${stageW}px;height:${stageH}px;` +
      'background:radial-gradient(ellipse at 50% 40%,#3a1a4a 0%,#1a0822 70%,#0a0410 100%);' +
      'border-radius:18px;border:3px solid #d4af37;' +
      'box-shadow:0 0 40px rgba(212,175,55,0.35),inset 0 0 60px rgba(0,0,0,0.6);' +
      'padding:30px;overflow:hidden;';

    // Subtle starfield specks for atmosphere
    for (let i = 0; i < 16; i++) {
      const star = document.createElement('div');
      const sx = Math.random() * stageW;
      const sy = Math.random() * stageH;
      const sz = 1 + Math.random() * 2;
      star.style.cssText =
        `position:absolute;left:${sx}px;top:${sy}px;width:${sz}px;height:${sz}px;` +
        `background:#fff;border-radius:50%;opacity:${0.2 + Math.random() * 0.5};` +
        'box-shadow:0 0 4px rgba(255,255,255,0.6);';
      stage.appendChild(star);
    }

    const flipName = `tarotFlip_${Date.now()}`;
    const dealName = `tarotDeal_${Date.now()}`;
    const styleEl = document.createElement('style');
    styleEl.textContent =
      `@keyframes ${flipName} { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(180deg); } }` +
      `@keyframes ${dealName} { 0% { transform: translateY(-180px) rotate(-15deg); opacity: 0; }` +
      ` 70% { opacity: 1; } 100% { transform: translateY(0) rotate(0deg); opacity: 1; } }`;
    document.head.appendChild(styleEl);

    // Pick the visual indices that get a real card. Always include the winner.
    const order2 = order.map((_, i) => i);
    for (let i = order2.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order2[i], order2[j]] = [order2[j], order2[i]];
    }
    const chosen = order2.slice(0, maxCards);
    if (!chosen.includes(targetIndex)) {
      chosen[chosen.length - 1] = targetIndex;
    }
    // Re-shuffle the chosen indices so the winner's card isn't always last visually.
    for (let i = chosen.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
    }
    const winnerVisualIdx = chosen.indexOf(targetIndex);

    const tarotTitles = ['THE STAR', 'THE SUN', 'THE MOON', 'THE FOOL', 'THE MAGICIAN', 'THE EMPRESS', 'THE WORLD', 'THE TOWER'];
    const tarotShuffled = [...tarotTitles].sort(() => Math.random() - 0.5);
    const cardsRow = document.createElement('div');
    cardsRow.style.cssText =
      `position:relative;display:flex;justify-content:center;align-items:center;gap:${gap}px;` +
      'width:100%;height:100%;';
    stage.appendChild(cardsRow);

    const cardEls = [];
    chosen.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const isWinner = orderIdx === targetIndex;

      const cardWrap = document.createElement('div');
      cardWrap.style.cssText =
        `position:relative;width:${cardW}px;height:${cardH}px;perspective:900px;` +
        `animation:${dealName} 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${visualIdx * 180}ms both;`;

      const card = document.createElement('div');
      card.style.cssText =
        'position:relative;width:100%;height:100%;transform-style:preserve-3d;' +
        'transition:transform 0.85s cubic-bezier(0.55, 0, 0.25, 1);';

      const back = document.createElement('div');
      back.style.cssText =
        'position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;' +
        'background:linear-gradient(135deg,#4b1d6e,#1a0640);' +
        'border:2px solid #d4af37;box-shadow:0 4px 10px rgba(0,0,0,0.5);' +
        'display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:46px;' +
        'font-family:Georgia,serif;text-shadow:0 0 8px rgba(212,175,55,0.8);';
      back.textContent = '\u2605';

      const front = document.createElement('div');
      front.style.cssText =
        'position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;' +
        'background:linear-gradient(180deg,#fffaf0,#e8dcc4);transform:rotateY(180deg);' +
        'border:2px solid #d4af37;box-shadow:0 4px 10px rgba(0,0,0,0.5);' +
        'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
        'padding:8px 6px;color:#3d1f0a;font-family:Georgia,serif;text-align:center;';

      const titleTop = document.createElement('div');
      titleTop.textContent = tarotShuffled[visualIdx % tarotShuffled.length];
      titleTop.style.cssText = 'font-size:9px;font-weight:700;letter-spacing:1.2px;color:#5a2e0a;';

      const portrait = document.createElement('div');
      portrait.style.cssText =
        'width:62px;height:62px;border-radius:50%;border:2px solid #d4af37;overflow:hidden;' +
        'box-shadow:inset 0 0 6px rgba(0,0,0,0.4),0 2px 4px rgba(0,0,0,0.3);';
      const portraitImg = document.createElement('img');
      portraitImg.src = person.avatarUrl;
      portraitImg.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      portrait.appendChild(portraitImg);

      const nameTag = document.createElement('div');
      nameTag.textContent = person.name.split(' ')[0].slice(0, 10);
      nameTag.style.cssText = 'font-size:11px;font-weight:700;font-style:italic;';

      front.appendChild(titleTop);
      front.appendChild(portrait);
      front.appendChild(nameTag);

      card.appendChild(back);
      card.appendChild(front);
      cardWrap.appendChild(card);
      cardsRow.appendChild(cardWrap);
      cardEls.push({ wrap: cardWrap, card, front, isWinner });
    });

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Reveal cards in shuffled order with the winner ALWAYS last so the spotlight lands on them.
    const revealOrder = cardEls.map((_, i) => i).filter(i => i !== winnerVisualIdx);
    for (let i = revealOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [revealOrder[i], revealOrder[j]] = [revealOrder[j], revealOrder[i]];
    }
    revealOrder.push(winnerVisualIdx);

    const dealEnd = chosen.length * 180 + 800;
    // Reserve more time for the final winner reveal so the gold halo can breathe.
    const winnerHold = 900;
    const flipWindow = Math.max(900, tarotDuration - dealEnd - winnerHold);
    const flipStep = flipWindow / Math.max(1, revealOrder.length - 1);

    revealOrder.forEach((visualIdx, n) => {
      const isLast = n === revealOrder.length - 1;
      // Non-winners flip on a steady cadence; the winner flips after a deliberate pause.
      const at = isLast
        ? dealEnd + (revealOrder.length - 1) * flipStep + 350
        : dealEnd + n * flipStep;
      setTimeout(() => {
        const { card, front, isWinner } = cardEls[visualIdx];
        card.style.transform = 'rotateY(180deg)';
        if (!isWinner) {
          // Do not put filter/opacity on wrap or card: both flatten
          // preserve-3d and the flipped face goes blank. Gray the
          // 2D front contents so the card stays visible.
          setTimeout(() => {
            front.style.background = 'linear-gradient(180deg,#d0d0d0,#9a9a9a)';
            front.style.borderColor = '#7a7a7a';
            front.style.color = '#4a4a4a';
            const img = front.querySelector('img');
            if (img) img.style.filter = 'grayscale(1) brightness(0.75)';
            const title = front.firstChild;
            if (title && title.style) title.style.color = '#5a5a5a';
          }, 500);
        } else if (isLast) {
          setTimeout(() => {
            cardEls[visualIdx].wrap.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s';
            cardEls[visualIdx].wrap.style.transform = 'scale(1.18) translateY(-10px)';
            cardEls[visualIdx].wrap.style.filter = 'drop-shadow(0 0 22px rgba(212,175,55,0.95))';
          }, 450);
        }
      }, at);
    });

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, tarotDuration + 100);
  }

  /** Claw machine: a crane claw glides along a rail, descends into a heap of plush avatars,
   *  grabs the winner, ascends, slides over to the prize chute, and drops them into the
   *  reward tray at the bottom. Mechanical and very satisfying. */
