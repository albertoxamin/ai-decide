import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'blackjack';
export const label = 'Blackjack table';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    // Blackjack needs more time: deal each card, suspense between flips, dealer reveal,
    // then the winner's BLACKJACK moment. Default 3000ms is way too tight.
    const blackjackDuration = Math.max(CONFIG.spinDuration, 6000);

    const w = 720;
    const h = 480;
    const stage = document.createElement('div');
    stage.style.cssText =
      `position:relative;width:${w}px;height:${h}px;` +
      'background:radial-gradient(ellipse at 50% 30%,#2a8050 0%,#1a5030 60%,#0a2820 100%);' +
      'border-radius:240px 240px 18px 18px / 200px 200px 18px 18px;' +
      'border:8px solid #5a3f1f;' +
      'box-shadow:0 0 40px rgba(0,0,0,0.6),inset 0 0 60px rgba(0,0,0,0.5);overflow:hidden;';

    // Felt curve guide line
    const arc = document.createElement('div');
    arc.style.cssText =
      'position:absolute;left:50%;top:30%;transform:translateX(-50%);width:80%;height:60%;' +
      'border:2px dashed rgba(255,255,255,0.18);border-radius:50%;pointer-events:none;';
    stage.appendChild(arc);

    // Casino label
    const label = document.createElement('div');
    label.textContent = 'BLACKJACK \u2660\uFE0F  PAYS 3 TO 2';
    label.style.cssText =
      'position:absolute;top:18px;left:50%;transform:translateX(-50%);' +
      'color:rgba(255,255,255,0.55);font-family:Georgia,serif;font-size:13px;letter-spacing:3px;font-weight:700;' +
      'text-shadow:0 1px 2px rgba(0,0,0,0.6);';
    stage.appendChild(label);

    // Dealer at the top center
    const dealerY = 60;
    const dealer = document.createElement('div');
    dealer.style.cssText =
      `position:absolute;left:50%;top:${dealerY}px;transform:translateX(-50%);` +
      'display:flex;flex-direction:column;align-items:center;gap:6px;color:#fff;font-size:12px;font-weight:700;';
    const dealerBadge = document.createElement('div');
    dealerBadge.textContent = '\uD83C\uDFB0 DEALER';
    dealerBadge.style.cssText = 'background:rgba(0,0,0,0.45);padding:4px 10px;border-radius:10px;letter-spacing:1px;';
    dealer.appendChild(dealerBadge);

    // Two dealer cards (one face up = 10, one face down then revealed)
    const dealerHand = document.createElement('div');
    dealerHand.style.cssText = 'display:flex;gap:6px;margin-top:4px;';
    dealer.appendChild(dealerHand);
    stage.appendChild(dealer);

    // Player layout: arc across the bottom half of the table
    const playerCount = order.length;
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }
    const winnerVisualIdx = layout.indexOf(targetIndex);

    // Position players evenly along an arc
    const arcCx = w / 2;
    const arcCy = h - 70;
    const arcR = Math.min(280, w / 2 - 50);

    const cardW = 46;
    const cardH = 64;

    function makeCard(value, suit) {
      const card = document.createElement('div');
      card.style.cssText =
        `position:relative;width:${cardW}px;height:${cardH}px;perspective:600px;`;
      const inner = document.createElement('div');
      inner.style.cssText =
        'position:absolute;inset:0;transform-style:preserve-3d;' +
        'transition:transform 0.8s cubic-bezier(0.55, 0, 0.25, 1);';
      const back = document.createElement('div');
      back.style.cssText =
        'position:absolute;inset:0;border-radius:6px;backface-visibility:hidden;' +
        'background:repeating-linear-gradient(45deg,#a01818 0,#a01818 6px,#7a0a0a 6px,#7a0a0a 12px);' +
        'border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.5);';
      const front = document.createElement('div');
      const isRed = suit === '\u2665' || suit === '\u2666';
      front.style.cssText =
        'position:absolute;inset:0;border-radius:6px;backface-visibility:hidden;' +
        `background:#fff;color:${isRed ? '#c8102e' : '#111'};` +
        'transform:rotateY(180deg);border:1.5px solid #ccc;box-shadow:0 2px 4px rgba(0,0,0,0.5);' +
        'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
        'padding:4px 4px;font-family:Georgia,serif;font-weight:800;';
      const tl = document.createElement('span');
      tl.textContent = value;
      tl.style.cssText = 'font-size:12px;line-height:1;align-self:flex-start;';
      const mid = document.createElement('span');
      mid.textContent = suit;
      mid.style.cssText = 'font-size:22px;line-height:1;';
      const br = document.createElement('span');
      br.textContent = value;
      br.style.cssText = 'font-size:12px;line-height:1;align-self:flex-end;transform:rotate(180deg);';
      front.appendChild(tl);
      front.appendChild(mid);
      front.appendChild(br);
      inner.appendChild(back);
      inner.appendChild(front);
      card.appendChild(inner);
      return { root: card, inner };
    }

    // Build each player's hand in advance (winner = 21, others < 21 or bust)
    const suits = ['\u2660', '\u2665', '\u2666', '\u2663'];
    const playerEls = [];
    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const isWinner = orderIdx === targetIndex;
      // Spread players evenly along the bottom arc.
      const span = Math.PI * 0.75;
      const startAngle = Math.PI / 2 + span / 2;
      const angle = playerCount === 1
        ? Math.PI / 2
        : startAngle - (visualIdx / (playerCount - 1)) * span;
      const px = arcCx + arcR * Math.cos(angle) - 60;
      const py = arcCy - arcR * Math.sin(angle) * 0.55 - 60;

      const seat = document.createElement('div');
      seat.style.cssText =
        `position:absolute;left:${px}px;top:${py}px;width:120px;` +
        'display:flex;flex-direction:column;align-items:center;gap:4px;color:#fff;font-size:11px;font-weight:700;' +
        'transition:filter 0.4s, transform 0.4s;';

      const hand = document.createElement('div');
      hand.style.cssText = 'display:flex;gap:4px;height:64px;';

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #d4af37;box-shadow:0 2px 4px rgba(0,0,0,0.5);';

      const nameLabel = document.createElement('span');
      nameLabel.textContent = person.name.split(' ')[0].slice(0, 10);
      nameLabel.style.cssText = 'text-shadow:0 1px 2px rgba(0,0,0,0.7);';

      const scoreBadge = document.createElement('div');
      scoreBadge.style.cssText =
        'background:rgba(0,0,0,0.55);padding:3px 10px;border-radius:8px;font-size:11px;letter-spacing:1px;' +
        'opacity:0;transition:opacity 0.3s, background 0.3s, color 0.3s, transform 0.3s;';
      scoreBadge.textContent = '?';

      seat.appendChild(hand);
      seat.appendChild(img);
      seat.appendChild(nameLabel);
      seat.appendChild(scoreBadge);
      stage.appendChild(seat);

      // Decide cards: winner -> A + 10-value (BLACKJACK); losers -> random 12-19 or bust.
      let c1Val, c1Suit, c2Val, c2Suit, score, label2;
      const suit1 = suits[Math.floor(Math.random() * 4)];
      const suit2 = suits[Math.floor(Math.random() * 4)];
      if (isWinner) {
        c1Val = 'A';
        c1Suit = suit1;
        const tens = ['10', 'J', 'Q', 'K'];
        c2Val = tens[Math.floor(Math.random() * tens.length)];
        c2Suit = suit2;
        score = 21;
        label2 = 'BLACKJACK!';
      } else {
        // Random hand: roughly half stand low, half bust
        if (Math.random() < 0.5) {
          score = 22 + Math.floor(Math.random() * 6); // bust: 22-27
        } else {
          score = 13 + Math.floor(Math.random() * 7); // stand: 13-19
        }
        // Pick two card values that roughly add up
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        c1Val = ranks[Math.floor(Math.random() * ranks.length)];
        c2Val = ranks[Math.floor(Math.random() * ranks.length)];
        c1Suit = suit1;
        c2Suit = suit2;
        label2 = score > 21 ? `BUST (${score})` : String(score);
      }

      const card1 = makeCard(c1Val, c1Suit);
      const card2 = makeCard(c2Val, c2Suit);
      hand.appendChild(card1.root);
      hand.appendChild(card2.root);

      playerEls.push({ seat, card1, card2, scoreBadge, label2, isWinner, score });
    });

    // Dealer's two cards (Q + 7 = 17 stands)
    const dealerCard1 = makeCard('Q', '\u2660');
    const dealerCard2 = makeCard('7', '\u2666');
    dealerHand.appendChild(dealerCard1.root);
    dealerHand.appendChild(dealerCard2.root);

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Phase timings: deal -> reveal players (winner last) -> dealer reveal -> spotlight
    const totalDealCards = playerEls.length * 2 + 2;
    const perDeal = 140; // fixed per-card stagger so a busier table feels deliberate, not panicked

    // Pre-rotate all cards for a "deal" effect: start above the dealer, slide to position.
    [...playerEls.flatMap(p => [p.card1.root, p.card2.root]), dealerCard1.root, dealerCard2.root].forEach((cardRoot, i) => {
      cardRoot.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.55s';
      cardRoot.style.transform = 'translate(0, -260px) rotate(-15deg)';
      cardRoot.style.opacity = '0';
      setTimeout(() => {
        cardRoot.style.transform = 'translate(0, 0) rotate(0deg)';
        cardRoot.style.opacity = '1';
      }, 120 + i * perDeal);
    });

    // Reveal players (non-winners first), then dealer, then winner.
    const dealEnd = 120 + totalDealCards * perDeal + 550;
    // Reserve a generous window for the winner's BLACKJACK moment so it gets to land
    // (the BLACKJACK badge appears 700ms AFTER the final card flips — that delay used to
    // eat almost the entire hold window).
    const winnerHold = 2800;
    const remaining = Math.max(1200, blackjackDuration - dealEnd - winnerHold);
    const nonWinners = playerEls.map((_, i) => i).filter(i => i !== winnerVisualIdx);
    for (let i = nonWinners.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nonWinners[i], nonWinners[j]] = [nonWinners[j], nonWinners[i]];
    }

    const revealSchedule = [];
    nonWinners.forEach(idx => revealSchedule.push({ kind: 'player', idx }));
    revealSchedule.push({ kind: 'dealer' });
    revealSchedule.push({ kind: 'player', idx: winnerVisualIdx });

    // Step is over the non-winner + dealer reveals; the winner gets the dedicated hold afterward.
    const stepMs = remaining / Math.max(1, revealSchedule.length - 1);
    // Absolute time at which the BLACKJACK badge becomes visible on the winner's seat.
    // (Card flip happens at `winnerCardFlipAt`; badge appears 700ms later.)
    const winnerCardFlipAt = dealEnd + (revealSchedule.length - 1) * stepMs + 400;
    const winnerBadgeAt = winnerCardFlipAt + 700;

    revealSchedule.forEach((step, n) => {
      const isLast = n === revealSchedule.length - 1;
      const at = isLast
        ? winnerCardFlipAt
        : dealEnd + n * stepMs;
      setTimeout(() => {
        if (step.kind === 'dealer') {
          dealerCard1.inner.style.transform = 'rotateY(180deg)';
          setTimeout(() => { dealerCard2.inner.style.transform = 'rotateY(180deg)'; }, 380);
          return;
        }
        const p = playerEls[step.idx];
        p.card1.inner.style.transform = 'rotateY(180deg)';
        setTimeout(() => { p.card2.inner.style.transform = 'rotateY(180deg)'; }, 380);
        setTimeout(() => {
          p.scoreBadge.textContent = p.label2;
          p.scoreBadge.style.opacity = '1';
          if (p.isWinner) {
            p.scoreBadge.style.background = '#ffcc00';
            p.scoreBadge.style.color = '#222';
            p.scoreBadge.style.transform = 'scale(1.15)';
            p.scoreBadge.style.fontSize = '13px';
            p.seat.style.transform = 'scale(1.12) translateY(-6px)';
            p.seat.style.filter = 'drop-shadow(0 0 18px rgba(255,204,0,0.85))';
          } else if (p.score > 21) {
            p.scoreBadge.style.background = '#c8102e';
            p.scoreBadge.style.color = '#fff';
            p.seat.style.filter = 'grayscale(0.8) brightness(0.6)';
          } else {
            p.scoreBadge.style.background = 'rgba(0,0,0,0.7)';
            p.seat.style.filter = 'grayscale(0.5) brightness(0.7)';
          }
        }, 700);
      }, at);
    });

    // Close timing must give the BLACKJACK badge enough dwell time to actually be read.
    const closeAt = Math.max(blackjackDuration + 100, winnerBadgeAt + 1800);
    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, closeAt);
  }

  /** Magic 8-Ball picker. A heavy black sphere levitates, gets shaken, and the answer
   *  rises into a triangular window. Names cycle as ghostly text inside the window,
   *  slow down, then settle on the winner with a soft blue glow. */
