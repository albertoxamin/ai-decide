import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'odyssey';
export const label = 'Challenge of the Bow';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];
    const AXE_COUNT = 12;
    const CANDIDATE_MS = 1000;
    const flightMs = 600;
    const holdMs = 400;

    const headline = document.createElement('div');
    headline.textContent = 'Challenge of the Bow';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
    overlay.appendChild(headline);

    const stageW = 640;
    const stageH = 390;
    const holeY = 158;
    const stage = document.createElement('div');
    stage.style.cssText =
      'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
      'background:linear-gradient(180deg,#3a2414 0%,#1c120c 48%,#2a1a10 100%);' +
      'border:5px solid #1b110a;border-radius:10px;' +
      'box-shadow:0 24px 50px rgba(0,0,0,0.7), inset 0 0 80px rgba(217,154,43,0.12);';
    overlay.appendChild(stage);

    const caption = document.createElement('div');
    caption.textContent = "Penelope's contest \u2014 string the bow, shoot through twelve axes";
    caption.style.cssText =
      'position:absolute;left:16px;right:16px;top:12px;text-align:center;' +
      'font-family:"Fraunces",Georgia,serif;font-size:13px;font-style:italic;' +
      'color:#e8d5a8;letter-spacing:0.4px;z-index:8;' +
      'text-shadow:0 1px 2px rgba(0,0,0,0.8);';
    stage.appendChild(caption);

    // Hall columns
    [18, stageW - 34].forEach(function (x) {
      const col = document.createElement('div');
      col.style.cssText =
        'position:absolute;left:' + x + 'px;top:42px;width:16px;bottom:78px;' +
        'background:linear-gradient(90deg,#6b4a28,#3a2814 40%,#5a3c20);' +
        'border-radius:8px 8px 2px 2px;box-shadow:inset -3px 0 6px rgba(0,0,0,0.45);';
      stage.appendChild(col);
    });

    // Floor
    const floor = document.createElement('div');
    floor.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;height:78px;' +
      'background:linear-gradient(180deg,#4a3420 0%,#2c1c10 100%);' +
      'border-top:3px solid #1b110a;';
    stage.appendChild(floor);

    // Archer dais
    const dais = document.createElement('div');
    dais.style.cssText =
      'position:absolute;left:28px;bottom:78px;width:96px;height:14px;' +
      'background:linear-gradient(180deg,#8a6230,#4a3018);border:2px solid #1b110a;border-radius:3px;';
    stage.appendChild(dais);

    const archerWrap = document.createElement('div');
    archerWrap.style.cssText =
      'position:absolute;left:40px;bottom:92px;width:72px;' +
      'display:flex;flex-direction:column;align-items:center;gap:4px;z-index:6;' +
      'transition:filter 0.35s, transform 0.35s;';
    const archerImg = document.createElement('img');
    archerImg.src = order[0].avatarUrl;
    archerImg.style.cssText =
      'width:56px;height:56px;border-radius:50%;object-fit:cover;' +
      'border:3px solid #d99a2b;box-shadow:0 0 16px rgba(217,154,43,0.45);';
    const archerName = document.createElement('div');
    archerName.textContent = String(order[0].name).slice(0, 10);
    archerName.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#fbf4dd;' +
      'letter-spacing:0.5px;text-shadow:0 1px 2px #000;max-width:90px;text-align:center;';
    archerWrap.appendChild(archerImg);
    archerWrap.appendChild(archerName);
    stage.appendChild(archerWrap);

    // Bow facing the axes: stave bulges right (toward the targets), string
    // on the archer's side (left). Unstrung at first — slack string.
    const bow = document.createElement('div');
    bow.style.cssText =
      'position:absolute;left:108px;top:' + (holeY - 72) + 'px;width:70px;height:148px;' +
      'transform-origin:80% 50%;z-index:5;';
    bow.innerHTML =
      '<svg viewBox="0 0 70 148" width="70" height="148" aria-hidden="true">' +
        '<path d="M52 10 C62 40, 62 108, 52 138" fill="none" stroke="#6b3a18" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M52 10 C62 40, 62 108, 52 138" fill="none" stroke="#d99a2b" stroke-width="3" stroke-linecap="round"/>' +
        '<path id="bow-string" d="M52 12 Q28 74 52 136" fill="none" stroke="#e8d9b0" stroke-width="2"/>' +
      '</svg>';
    stage.appendChild(bow);
    const bowString = bow.querySelector('#bow-string');

    // Twelve axe-heads in a row, sockets aligned on the arrow path
    const axeStartX = 188;
    const axeGap = 35;
    const axeEls = [];
    for (let i = 0; i < AXE_COUNT; i++) {
      const axe = document.createElement('div');
      const x = axeStartX + i * axeGap;
      axe.style.cssText =
        'position:absolute;left:' + x + 'px;top:' + (holeY - 22) + 'px;width:28px;height:150px;' +
        'z-index:3;transition:filter 0.35s;';
      axe.innerHTML =
        '<div style="position:absolute;left:11px;top:38px;width:6px;height:108px;' +
        'background:linear-gradient(90deg,#8a5a28,#3a2410);border:1px solid #1b110a;border-radius:2px;"></div>' +
        '<div style="position:absolute;left:1px;top:0;width:26px;height:42px;' +
        'background:radial-gradient(circle at 40% 40%,#d4a24a,#8a5a18 70%,#3a2410);' +
        'border:2px solid #1b110a;border-radius:40% 40% 28% 28%;' +
        'box-shadow:inset 0 -4px 8px rgba(0,0,0,0.35);"></div>' +
        '<div style="position:absolute;left:8px;top:11px;width:12px;height:12px;border-radius:50%;' +
        'background:#1c120c;border:2px solid #e8d5a8;box-shadow:inset 0 0 4px #000;"></div>';
      stage.appendChild(axe);
      axeEls.push(axe);
    }

    // Arrow (hidden until the winning shot)
    const arrow = document.createElement('div');
    const arrowStart = 118;
    const lastAxeX = axeStartX + (AXE_COUNT - 1) * axeGap + 22;
    arrow.style.cssText =
      'position:absolute;left:' + arrowStart + 'px;top:' + (holeY - 5) + 'px;' +
      'width:46px;height:10px;z-index:7;opacity:0;pointer-events:none;';
    arrow.innerHTML =
      '<div style="position:absolute;left:0;top:3px;width:34px;height:4px;background:linear-gradient(90deg,#e8d9b0,#8a6230);border-radius:1px;"></div>' +
      '<div style="position:absolute;right:0;top:0;width:0;height:0;border-top:5px solid transparent;border-bottom:5px solid transparent;border-left:12px solid #c83a1e;"></div>' +
      '<div style="position:absolute;left:-4px;top:1px;width:8px;height:8px;background:#2c5d52;clip-path:polygon(100% 50%,0 0,0 100%);"></div>';
    stage.appendChild(arrow);

    // Bottom roster of suitors
    const roster = document.createElement('div');
    roster.style.cssText =
      'position:absolute;left:12px;right:12px;bottom:10px;height:58px;' +
      'display:flex;align-items:center;justify-content:center;gap:6px;overflow:hidden;';
    stage.appendChild(roster);
    const rosterEls = order.map(function (person, i) {
      const chip = document.createElement('div');
      chip.style.cssText =
        'display:flex;flex-direction:column;align-items:center;gap:2px;' +
        'transition:opacity 0.35s, filter 0.35s, transform 0.35s;';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText =
        'width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid #5a4232;';
      const nm = document.createElement('span');
      nm.textContent = String(person.name).slice(0, 7);
      nm.style.cssText = 'font-size:8px;color:#e8d5a8;font-weight:600;max-width:36px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      chip.appendChild(img);
      chip.appendChild(nm);
      roster.appendChild(chip);
      return { chip: chip, img: img, index: i };
    });

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes bowStruggle { 0%,100% { transform: rotate(0deg) translateX(0); } ' +
      '25% { transform: rotate(-8deg) translateX(-2px); } 75% { transform: rotate(7deg) translateX(3px); } }' +
      '@keyframes torchFlicker { 0%,100% { opacity: 0.35; } 50% { opacity: 0.7; } }' +
      '@keyframes axeRing { 0% { filter: drop-shadow(0 0 0 rgba(255,232,150,0)); } ' +
      '100% { filter: drop-shadow(0 0 10px rgba(255,232,150,0.95)); } }';
    document.head.appendChild(styleEl);

    const torch = document.createElement('div');
    torch.style.cssText =
      'position:absolute;right:48px;top:48px;width:70px;height:70px;border-radius:50%;' +
      'background:radial-gradient(circle, rgba(255,180,60,0.55), transparent 70%);' +
      'pointer-events:none;animation:torchFlicker 1.1s ease-in-out infinite;';
    stage.appendChild(torch);

    document.body.appendChild(overlay);

    const FAIL_LINES = [
      'The bow will not yield',
      'He cannot even string it',
      'Bronze and horn defy him',
      'The suitor sits down in shame',
    ];
    const tryOrder = order.map(function (_, i) { return i; }).filter(function (i) { return i !== targetIndex; });
    for (let i = tryOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = tryOrder[i];
      tryOrder[i] = tryOrder[j];
      tryOrder[j] = tmp;
    }
    if (tryOrder.length === 0) tryOrder.push(targetIndex);

    const failers = tryOrder.filter(function (i) { return i !== targetIndex; });
    const tryMs = failers.length * CANDIDATE_MS;
    const stringMs = CANDIDATE_MS;
    let shownFails = 0;

    function setArcher(person) {
      archerImg.src = person.avatarUrl;
      archerName.textContent = String(person.name).slice(0, 10);
    }

    failers.forEach(function (idx, n) {
      setTimeout(function () {
        const person = order[idx];
        setArcher(person);
        bow.style.animation = 'none';
        void bow.offsetWidth;
        bow.style.animation = 'bowStruggle 0.28s linear infinite';
        caption.textContent = String(person.name) + ' takes the bow\u2026';
        rosterEls.forEach(function (r) {
          r.img.style.borderColor = r.index === idx ? '#e35636' : '#5a4232';
        });
        setTimeout(function () {
          bow.style.animation = 'none';
          caption.textContent = FAIL_LINES[shownFails % FAIL_LINES.length];
          shownFails++;
          const r = rosterEls[idx];
          r.chip.style.opacity = '0.35';
          r.chip.style.filter = 'grayscale(1)';
        }, 650);
      }, n * CANDIDATE_MS);
    });

    setTimeout(function () {
      bow.style.animation = 'none';
      setArcher(winner);
      caption.textContent = String(winner.name) + ' strings it as a bard strings a lyre';
      archerWrap.style.transform = 'scale(1.08)';
      archerImg.style.borderColor = '#ffd86b';
      archerImg.style.boxShadow = '0 0 22px rgba(255,232,150,0.9)';
      rosterEls.forEach(function (r) {
        if (r.index === targetIndex) {
          r.chip.style.opacity = '1';
          r.chip.style.filter = 'none';
          r.chip.style.transform = 'translateY(-6px) scale(1.12)';
          r.img.style.borderColor = '#ffd86b';
        }
      });
      // Snap the string taut (vertical, archer-side)
      if (bowString) bowString.setAttribute('d', 'M52 12 L52 136');
      bow.style.transition = 'transform 0.35s cubic-bezier(0.3,1.5,0.5,1)';
      bow.style.transform = 'rotate(6deg)';
    }, tryMs);

    setTimeout(function () {
      caption.textContent = 'The bronze sings \u2014 through twelve axe-heads';
      arrow.style.opacity = '1';
      arrow.style.transition = 'left ' + flightMs + 'ms cubic-bezier(0.22, 0.7, 0.35, 1)';
      arrow.style.left = lastAxeX + 'px';
      axeEls.forEach(function (axe, i) {
        setTimeout(function () {
          axe.style.animation = 'axeRing 0.28s ease-out forwards';
        }, Math.round((i / AXE_COUNT) * flightMs));
      });
    }, tryMs + stringMs);

    setTimeout(function () {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, tryMs + stringMs + flightMs + holdMs);
  }

  /** Oscars envelope picker. A gold envelope trembles on a red-carpet podium
   *  while nominee names tick by. The flap lifts, a card slides out with the
   *  winner, and the rest of the roster goes grayscale in their seats. */
