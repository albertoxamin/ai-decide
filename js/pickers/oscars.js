import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'oscars';
export const label = 'Oscars envelope';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];
    const totalMs = CONFIG.spinDuration;
    const drumMs = Math.max(1400, Math.round(totalMs * 0.55));
    const openMs = Math.max(500, Math.round(totalMs * 0.18));
    const holdMs = Math.max(450, totalMs - drumMs - openMs);

    const headline = document.createElement('div');
    headline.textContent = 'And the pick is\u2026';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
      'color:#f6e27a;text-shadow:0 3px 0 rgba(0,0,0,0.65);text-transform:uppercase;';
    overlay.appendChild(headline);

    const stageW = 620;
    const stageH = 400;
    const stage = document.createElement('div');
    stage.style.cssText =
      'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
      'background:radial-gradient(ellipse at 50% 30%,#5a1028 0%,#1a050c 62%,#0a0206 100%);' +
      'border:5px solid #d4af37;border-radius:12px;' +
      'box-shadow:0 24px 50px rgba(0,0,0,0.7), inset 0 0 80px rgba(212,175,55,0.12);';
    overlay.appendChild(stage);

    const caption = document.createElement('div');
    caption.textContent = 'The envelope, please';
    caption.style.cssText =
      'position:absolute;left:16px;right:16px;top:12px;text-align:center;z-index:8;' +
      'font-family:"Fraunces",Georgia,serif;font-size:13px;font-style:italic;color:#f6e27a;' +
      'text-shadow:0 1px 3px #000;letter-spacing:0.4px;';
    stage.appendChild(caption);

    // Curtains
    ['left:0;background:linear-gradient(90deg,#8a1028,#4a0814);',
     'right:0;background:linear-gradient(270deg,#8a1028,#4a0814);'].forEach(function (side) {
      const c = document.createElement('div');
      c.style.cssText =
        'position:absolute;top:0;bottom:0;width:46px;' + side +
        'box-shadow:inset -8px 0 16px rgba(0,0,0,0.45);';
      stage.appendChild(c);
    });

    // Spotlight
    const spot = document.createElement('div');
    spot.style.cssText =
      'position:absolute;left:50%;top:36px;width:280px;height:220px;transform:translateX(-50%);' +
      'background:radial-gradient(ellipse at 50% 0%, rgba(255,232,150,0.28), transparent 70%);' +
      'pointer-events:none;z-index:1;';
    stage.appendChild(spot);

    const ENV_W = 168;
    const FLAP_H = 56;
    const BODY_H = 96;

    // Podium under the envelope
    const podium = document.createElement('div');
    podium.style.cssText =
      'position:absolute;left:50%;bottom:88px;width:188px;height:18px;margin-left:-94px;' +
      'background:linear-gradient(180deg,#2a1208,#120806);border:2px solid #d4af37;border-radius:4px;' +
      'z-index:3;';
    stage.appendChild(podium);

    // Envelope stack — centered with margin, never with transform, so shake/open
    // don't knock it sideways.
    const envWrap = document.createElement('div');
    envWrap.style.cssText =
      'position:absolute;left:50%;top:70px;width:' + ENV_W + 'px;height:200px;' +
      'margin-left:-' + (ENV_W / 2) + 'px;z-index:5;transform-origin:50% 85%;';

    const bodyTop = 200 - BODY_H;

    const card = document.createElement('div');
    card.style.cssText =
      'position:absolute;left:16px;width:' + (ENV_W - 32) + 'px;height:118px;' +
      'bottom:14px;z-index:1;' +
      'background:#fbf4dd;border:2px solid #5a4308;border-radius:6px;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;' +
      'box-shadow:0 6px 14px rgba(0,0,0,0.4);' +
      'transition:bottom 0.55s cubic-bezier(0.22, 0.9, 0.3, 1);';
    const cardImg = document.createElement('img');
    cardImg.src = winner.avatarUrl;
    cardImg.style.cssText =
      'width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #d4af37;';
    const cardName = document.createElement('div');
    cardName.textContent = String(winner.name);
    cardName.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:13px;color:#1b110a;letter-spacing:0.5px;text-align:center;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    card.appendChild(cardImg);
    card.appendChild(cardName);

    const envBody = document.createElement('div');
    envBody.style.cssText =
      'position:absolute;left:0;bottom:0;width:' + ENV_W + 'px;height:' + BODY_H + 'px;z-index:2;' +
      'background:linear-gradient(180deg,#f6e27a,#c9a227 72%,#8a7018);border:2px solid #5a4308;' +
      'border-radius:4px 4px 8px 8px;box-shadow:0 8px 18px rgba(0,0,0,0.55);';

    const envSeal = document.createElement('div');
    envSeal.style.cssText =
      'position:absolute;left:50%;top:36px;margin-left:-14px;width:28px;height:28px;border-radius:50%;' +
      'background:radial-gradient(circle at 35% 30%,#ff5a4a,#8a1018);border:2px solid #5a0808;' +
      'transition:opacity 0.3s ease;z-index:5;';
    envBody.appendChild(envSeal);

    // Closed: triangle pointing down, covering the card. Open: same hinge
    // (top of the body) but triangle pointing up.
    const flap = document.createElement('div');
    flap.style.cssText =
      'position:absolute;left:0;top:' + bodyTop + 'px;width:0;height:0;z-index:4;' +
      'border-left:' + (ENV_W / 2) + 'px solid transparent;' +
      'border-right:' + (ENV_W / 2) + 'px solid transparent;' +
      'border-top:' + FLAP_H + 'px solid #e8c547;' +
      'border-bottom:0 solid transparent;' +
      'filter:drop-shadow(0 2px 2px rgba(0,0,0,0.3));' +
      'transition:top 0.45s ease, border-top-width 0.45s ease, border-bottom-width 0.45s ease;';

    envWrap.appendChild(card);
    envWrap.appendChild(envBody);
    envWrap.appendChild(flap);
    stage.appendChild(envWrap);

    // Nominee row
    const row = document.createElement('div');
    row.style.cssText =
      'position:absolute;left:12px;right:12px;bottom:12px;height:70px;' +
      'display:flex;align-items:flex-end;justify-content:center;gap:8px;z-index:4;';
    stage.appendChild(row);
    const nomineeEls = order.map(function (person, i) {
      const chip = document.createElement('div');
      chip.style.cssText =
        'display:flex;flex-direction:column;align-items:center;gap:3px;' +
        'transition:filter 0.4s, opacity 0.4s, transform 0.4s;';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText =
        'width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #d4af37;';
      const nm = document.createElement('span');
      nm.textContent = String(person.name).slice(0, 8);
      nm.style.cssText = 'font-size:9px;color:#f6e27a;font-weight:600;max-width:42px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      chip.appendChild(img);
      chip.appendChild(nm);
      row.appendChild(chip);
      return { chip: chip, img: img, index: i };
    });

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes oscarsShake { 0%,100% { transform: rotate(0deg); } ' +
      '25% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } ' +
      '75% { transform: rotate(-3deg); } }' +
      '@keyframes oscarsFlash { 0%,100% { opacity: 0.35; } 50% { opacity: 0.85; } }';
    document.head.appendChild(styleEl);

    const flash = document.createElement('div');
    flash.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:0;' +
      'background:radial-gradient(circle at 50% 40%, rgba(255,255,255,0.12), transparent 55%);' +
      'animation:oscarsFlash 1.2s ease-in-out infinite;';
    stage.appendChild(flash);

    document.body.appendChild(overlay);

    envWrap.style.animation = 'oscarsShake 0.22s linear infinite';

    const tickOrder = order.map(function (_, i) { return i; });
    for (let i = tickOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = tickOrder[i];
      tickOrder[i] = tickOrder[j];
      tickOrder[j] = tmp;
    }
    let tick = 0;
    const tickIv = setInterval(function () {
      const person = order[tickOrder[tick % tickOrder.length]];
      caption.textContent = 'Nominee \u2014 ' + person.name;
      nomineeEls.forEach(function (n) {
        n.img.style.boxShadow = n.index === tickOrder[tick % tickOrder.length]
          ? '0 0 12px rgba(246,226,122,0.9)' : 'none';
      });
      tick++;
    }, 160);

    setTimeout(function () {
      clearInterval(tickIv);
      envWrap.style.animation = 'none';
      envWrap.style.transform = 'rotate(0deg)';
      caption.textContent = 'The envelope is opened\u2026';
      envSeal.style.opacity = '0';
      card.style.zIndex = '6';
      flap.style.borderTopWidth = '0px';
      flap.style.borderBottomWidth = FLAP_H + 'px';
      flap.style.borderBottomColor = '#e8c547';
      flap.style.top = (bodyTop - FLAP_H) + 'px';
    }, drumMs);

    setTimeout(function () {
      card.style.bottom = '92px';
      caption.textContent = String(winner.name).toUpperCase();
      nomineeEls.forEach(function (n) {
        if (n.index === targetIndex) {
          n.chip.style.transform = 'translateY(-8px) scale(1.12)';
          n.img.style.borderColor = '#fff3a0';
          n.img.style.boxShadow = '0 0 16px rgba(246,226,122,0.95)';
        } else {
          n.chip.style.filter = 'grayscale(1)';
          n.chip.style.opacity = '0.4';
          n.img.style.boxShadow = 'none';
        }
      });
    }, drumMs + openMs);

    setTimeout(function () {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, drumMs + openMs + holdMs);
  }

  /** Penalty shootout picker. Kickers take turns from the spot. The keeper
   *  saves every miss (those avatars gray out). The winner's shot beats the
   *  dive, the net bulges, and GOAL lights up. */
