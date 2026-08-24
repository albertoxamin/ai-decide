import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'odyssey';
export const label = 'Challenge of the Bow';

function axeSvg(uid, i) {
  const gid = uid + '-axe-' + i;
  return (
    '<svg viewBox="0 0 40 168" width="40" height="168" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + gid + '-br" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#f4e2a8"/>' +
          '<stop offset="28%" stop-color="#d4a24a"/>' +
          '<stop offset="62%" stop-color="#8a5a18"/>' +
          '<stop offset="100%" stop-color="#3a2410"/>' +
        '</linearGradient>' +
        '<linearGradient id="' + gid + '-wd" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#5a3414"/>' +
          '<stop offset="40%" stop-color="#c48a3c"/>' +
          '<stop offset="100%" stop-color="#3a200c"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect x="17" y="50" width="6" height="114" rx="2.5" fill="url(#' + gid + '-wd)" stroke="#1b110a" stroke-width="1.4"/>' +
      '<rect x="15" y="50" width="10" height="16" rx="1.5" fill="#4a2c10" stroke="#1b110a" stroke-width="1"/>' +
      '<path d="M15 52 h10 M15 56 h10 M15 60 h10" stroke="#c49a54" stroke-width="0.8" opacity="0.7"/>' +
      '<path d="M20 6 C5 10, 1 22, 4 32 C7 42, 14 46, 20 48 C26 46, 33 42, 36 32 C39 22, 35 10, 20 6 Z" ' +
        'fill="url(#' + gid + '-br)" stroke="#1b110a" stroke-width="1.6"/>' +
      '<path d="M12 14 C16 12, 24 12, 28 16" fill="none" stroke="#fbf4dd" stroke-width="1.3" opacity="0.55"/>' +
      '<circle cx="20" cy="28" r="7.2" fill="#1c120c" stroke="#e8d5a8" stroke-width="2"/>' +
      '<circle cx="20" cy="28" r="3.4" fill="#0a0704" stroke="#8a6230" stroke-width="0.8"/>' +
    '</svg>'
  );
}

function bowSvg(uid) {
  return (
    '<svg viewBox="0 0 78 168" width="78" height="168" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + uid + '-stave" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#2a1408"/>' +
          '<stop offset="35%" stop-color="#8a3e12"/>' +
          '<stop offset="58%" stop-color="#e0a24a"/>' +
          '<stop offset="100%" stop-color="#4a220c"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M58 10 C74 28, 78 54, 70 84 C78 114, 74 140, 58 158" fill="none" ' +
        'stroke="url(#' + uid + '-stave)" stroke-width="11" stroke-linecap="round"/>' +
      '<path d="M58 10 C74 28, 78 54, 70 84 C78 114, 74 140, 58 158" fill="none" ' +
        'stroke="#f4d48a" stroke-width="2.4" stroke-linecap="round" opacity="0.45"/>' +
      '<circle cx="58" cy="10" r="4.4" fill="#d99a2b" stroke="#1b110a" stroke-width="1.2"/>' +
      '<circle cx="58" cy="158" r="4.4" fill="#d99a2b" stroke="#1b110a" stroke-width="1.2"/>' +
      '<rect x="63" y="76" width="14" height="16" rx="3" fill="#3a2410" stroke="#1b110a" stroke-width="1.1" transform="rotate(-6 70 84)"/>' +
      '<path d="M65 80 h10 M65 84 h10 M65 88 h10" stroke="#c49a54" stroke-width="0.9" opacity="0.8"/>' +
      '<path id="bow-string" d="M58 12 Q26 84 58 156" fill="none" stroke="#f4ead0" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>'
  );
}

function torchEl(x, flip) {
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;left:' + x + 'px;top:58px;width:28px;height:86px;z-index:4;' +
    (flip ? 'transform:scaleX(-1);' : '');
  el.innerHTML =
    '<div style="position:absolute;left:10px;top:38px;width:8px;height:44px;border-radius:3px;' +
      'background:linear-gradient(180deg,#c48a3c,#4a2810);border:1.5px solid #1b110a;"></div>' +
    '<div style="position:absolute;left:6px;top:32px;width:16px;height:10px;border-radius:3px;' +
      'background:#3a2414;border:1.5px solid #1b110a;"></div>' +
    '<div style="position:absolute;left:4px;top:0;width:20px;height:36px;' +
      'background:radial-gradient(ellipse at 50% 80%,#fff4c4 0%,#ffb030 28%,#c83a1e 62%,transparent 78%);' +
      'filter:blur(0.4px);animation:odyFlame 0.55s ease-in-out infinite alternate;"></div>';
  return el;
}

/** Ithaca's hall: suitors fail to string Odysseus's bow; the winner shoots through twelve axes. */
export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];
    const uid = 'ody' + Date.now();
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

    const stageW = 680;
    const stageH = 430;
    const holeY = 172;
    const stage = document.createElement('div');
    stage.style.cssText =
      'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
      'background:' +
        'linear-gradient(180deg,rgba(255,196,90,0.12) 0%,transparent 28%),' +
        'linear-gradient(180deg,#4a2c16 0%,#2a1810 38%,#1a100c 72%,#24160e 100%);' +
      'border:5px solid #1b110a;border-radius:12px;' +
      'box-shadow:0 24px 50px rgba(0,0,0,0.7), inset 0 0 90px rgba(217,154,43,0.14);';
    overlay.appendChild(stage);

    const meander = document.createElement('div');
    meander.style.cssText =
      'position:absolute;left:0;right:0;top:0;height:28px;z-index:2;' +
      'background:#1b110a repeating-linear-gradient(90deg,' +
        '#d99a2b 0 10px,#1b110a 10px 14px,#d99a2b 14px 18px,#1b110a 18px 28px,' +
        '#d99a2b 28px 32px,#1b110a 32px 42px);' +
      'border-bottom:3px solid #d99a2b;opacity:0.92;';
    stage.appendChild(meander);

    for (let b = 0; b < 7; b++) {
      const beam = document.createElement('div');
      beam.style.cssText =
        'position:absolute;top:28px;left:' + (18 + b * 98) + 'px;width:14px;height:52px;' +
        'background:linear-gradient(90deg,#6a4420,#3a2410 55%,#5a3818);' +
        'border:2px solid #1b110a;border-top:none;opacity:0.85;z-index:1;';
      stage.appendChild(beam);
    }

    const caption = document.createElement('div');
    caption.textContent = "Penelope's contest \u2014 string the bow, shoot through twelve axes";
    caption.style.cssText =
      'position:absolute;left:20px;right:20px;top:36px;text-align:center;' +
      'font-family:"Fraunces",Georgia,serif;font-size:14px;font-style:italic;' +
      'color:#f4e2b8;letter-spacing:0.4px;z-index:8;' +
      'text-shadow:0 2px 6px rgba(0,0,0,0.85);';
    stage.appendChild(caption);

    function column(x) {
      const col = document.createElement('div');
      col.style.cssText =
        'position:absolute;left:' + x + 'px;top:78px;width:26px;bottom:92px;z-index:2;' +
        'background:repeating-linear-gradient(90deg,#8a6238 0 4px,#5a3c20 4px 6px,#7a522c 6px 10px);' +
        'border:2px solid #1b110a;border-radius:4px 4px 2px 2px;' +
        'box-shadow:inset -6px 0 10px rgba(0,0,0,0.4), 4px 0 12px rgba(0,0,0,0.25);';
      const cap = document.createElement('div');
      cap.style.cssText =
        'position:absolute;left:-8px;top:-10px;width:42px;height:14px;' +
        'background:linear-gradient(180deg,#d4a24a,#8a5a20);border:2px solid #1b110a;border-radius:3px;';
      const base = document.createElement('div');
      base.style.cssText =
        'position:absolute;left:-8px;bottom:-8px;width:42px;height:12px;' +
        'background:linear-gradient(180deg,#8a5a20,#3a2410);border:2px solid #1b110a;border-radius:2px;';
      col.appendChild(cap);
      col.appendChild(base);
      stage.appendChild(col);
    }
    column(16);
    column(stageW - 42);

    const floor = document.createElement('div');
    floor.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;height:92px;z-index:2;' +
      'background:repeating-linear-gradient(90deg,#5a3c22 0 28px,#3a2412 28px 30px,#4a3018 30px 56px),' +
        'linear-gradient(180deg,#6a4a28 0%,#2c1c10 100%);' +
      'border-top:3px solid #1b110a;' +
      'box-shadow:inset 0 18px 24px rgba(0,0,0,0.35);';
    stage.appendChild(floor);

    const flightLine = document.createElement('div');
    flightLine.style.cssText =
      'position:absolute;left:150px;right:48px;top:' + (holeY - 1) + 'px;height:2px;z-index:3;' +
      'background:linear-gradient(90deg,transparent,rgba(255,216,107,0.22) 12%,rgba(255,216,107,0.38) 70%,transparent);' +
      'box-shadow:0 0 10px rgba(255,216,107,0.25);pointer-events:none;';
    stage.appendChild(flightLine);

    const dais = document.createElement('div');
    dais.style.cssText =
      'position:absolute;left:24px;bottom:92px;width:108px;height:18px;z-index:4;' +
      'background:linear-gradient(180deg,#c49a54,#6a4018);border:2px solid #1b110a;border-radius:4px;' +
      'box-shadow:0 4px 0 #1b110a;';
    stage.appendChild(dais);

    const archerWrap = document.createElement('div');
    archerWrap.style.cssText =
      'position:absolute;left:42px;bottom:108px;width:76px;' +
      'display:flex;flex-direction:column;align-items:center;gap:5px;z-index:6;' +
      'transition:filter 0.35s, transform 0.35s;';
    const archerImg = document.createElement('img');
    archerImg.src = order[0].avatarUrl;
    archerImg.style.cssText =
      'width:58px;height:58px;border-radius:50%;object-fit:cover;' +
      'border:3px solid #d99a2b;box-shadow:0 0 18px rgba(217,154,43,0.5);';
    const archerName = document.createElement('div');
    archerName.textContent = String(order[0].name).slice(0, 10);
    archerName.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#fbf4dd;' +
      'letter-spacing:0.5px;text-shadow:0 1px 3px #000;max-width:90px;text-align:center;';
    archerWrap.appendChild(archerImg);
    archerWrap.appendChild(archerName);
    stage.appendChild(archerWrap);

    const bow = document.createElement('div');
    bow.style.cssText =
      'position:absolute;left:112px;top:' + (holeY - 84) + 'px;width:78px;height:168px;' +
      'transform-origin:82% 50%;z-index:5;filter:drop-shadow(2px 4px 0 rgba(0,0,0,0.4));';
    bow.innerHTML = bowSvg(uid);
    stage.appendChild(bow);
    const bowString = bow.querySelector('#bow-string');

    const axeStartX = 196;
    const axeGap = 36;
    const axeEls = [];
    for (let i = 0; i < AXE_COUNT; i++) {
      const axe = document.createElement('div');
      const x = axeStartX + i * axeGap;
      axe.style.cssText =
        'position:absolute;left:' + x + 'px;top:' + (holeY - 28) + 'px;width:40px;height:168px;' +
        'z-index:3;transition:filter 0.35s;filter:drop-shadow(2px 3px 0 rgba(0,0,0,0.35));';
      axe.innerHTML = axeSvg(uid, i);
      stage.appendChild(axe);
      axeEls.push(axe);
    }

    const arrow = document.createElement('div');
    const arrowStart = 124;
    const lastAxeX = axeStartX + (AXE_COUNT - 1) * axeGap + 18;
    arrow.style.cssText =
      'position:absolute;left:' + arrowStart + 'px;top:' + (holeY - 7) + 'px;' +
      'width:58px;height:14px;z-index:7;opacity:0;pointer-events:none;' +
      'filter:drop-shadow(0 2px 2px rgba(0,0,0,0.45));';
    arrow.innerHTML =
      '<svg viewBox="0 0 58 14" width="58" height="14" aria-hidden="true">' +
        '<polygon points="0,7 10,1 10,13" fill="#2c5d52" stroke="#1b110a" stroke-width="0.8"/>' +
        '<polygon points="2,7 10,3 10,11" fill="#c83a1e"/>' +
        '<rect x="9" y="5.2" width="36" height="3.6" rx="1" fill="#e8d0a0" stroke="#1b110a" stroke-width="0.7"/>' +
        '<polygon points="44,7 58,1.5 58,12.5" fill="#c83a1e" stroke="#1b110a" stroke-width="0.8"/>' +
        '<polygon points="46,7 56,4 56,10" fill="#f4ead0"/>' +
      '</svg>';
    stage.appendChild(arrow);

    const roster = document.createElement('div');
    roster.style.cssText =
      'position:absolute;left:12px;right:12px;bottom:12px;height:64px;z-index:5;' +
      'display:flex;align-items:center;justify-content:center;gap:7px;overflow:hidden;';
    stage.appendChild(roster);
    const rosterEls = order.map(function (person, i) {
      const chip = document.createElement('div');
      chip.style.cssText =
        'display:flex;flex-direction:column;align-items:center;gap:3px;' +
        'transition:opacity 0.35s, filter 0.35s, transform 0.35s;';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText =
        'width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #8a6230;' +
        'box-shadow:0 2px 0 #1b110a;';
      const nm = document.createElement('span');
      nm.textContent = String(person.name).slice(0, 7);
      nm.style.cssText =
        'font-size:8px;color:#f4e2b8;font-weight:600;max-width:38px;' +
        'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 2px #000;';
      chip.appendChild(img);
      chip.appendChild(nm);
      roster.appendChild(chip);
      return { chip: chip, img: img, index: i };
    });

    stage.appendChild(torchEl(48, false));
    stage.appendChild(torchEl(stageW - 76, true));

    const glowL = document.createElement('div');
    glowL.style.cssText =
      'position:absolute;left:20px;top:40px;width:90px;height:90px;border-radius:50%;z-index:1;' +
      'background:radial-gradient(circle,rgba(255,170,50,0.42),transparent 70%);' +
      'pointer-events:none;animation:odyTorch 1.2s ease-in-out infinite;';
    const glowR = glowL.cloneNode(true);
    glowR.style.left = 'auto';
    glowR.style.right = '20px';
    glowR.style.animationDelay = '0.4s';
    stage.appendChild(glowL);
    stage.appendChild(glowR);

    for (let m = 0; m < 10; m++) {
      const mote = document.createElement('div');
      mote.style.cssText =
        'position:absolute;left:' + (80 + m * 54) + 'px;top:' + (70 + (m % 4) * 38) + 'px;' +
        'width:3px;height:3px;border-radius:50%;background:#f4e2b8;opacity:0.35;z-index:3;' +
        'animation:odyMote ' + (3.2 + (m % 3)) + 's ease-in-out ' + (m * 0.2) + 's infinite;pointer-events:none;';
      stage.appendChild(mote);
    }

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes bowStruggle { 0%,100% { transform: rotate(0deg) translateX(0); } ' +
      '25% { transform: rotate(-8deg) translateX(-2px); } 75% { transform: rotate(7deg) translateX(3px); } }' +
      '@keyframes odyTorch { 0%,100% { opacity: 0.45; } 50% { opacity: 0.9; } }' +
      '@keyframes odyFlame { from { transform: scale(1) translateY(0); } to { transform: scale(1.12) translateY(-3px); } }' +
      '@keyframes odyMote { 0%,100% { transform: translateY(0); opacity: 0.2; } 50% { transform: translateY(-10px); opacity: 0.55; } }' +
      '@keyframes axeRing { 0% { filter: drop-shadow(2px 3px 0 rgba(0,0,0,0.35)); } ' +
      '100% { filter: drop-shadow(2px 3px 0 rgba(0,0,0,0.35)) drop-shadow(0 0 12px rgba(255,232,150,0.95)); } }';
    document.head.appendChild(styleEl);

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
          r.img.style.borderColor = r.index === idx ? '#e35636' : '#8a6230';
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
      if (bowString) bowString.setAttribute('d', 'M58 12 L58 156');
      bow.style.transition = 'transform 0.35s cubic-bezier(0.3,1.5,0.5,1)';
      bow.style.transform = 'rotate(6deg)';
    }, tryMs);

    setTimeout(function () {
      if (bowString) bowString.setAttribute('d', 'M58 12 Q18 84 58 156');
    }, tryMs + stringMs - 160);

    setTimeout(function () {
      caption.textContent = 'The bronze sings \u2014 through twelve axe-heads';
      if (bowString) bowString.setAttribute('d', 'M58 12 L58 156');
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
