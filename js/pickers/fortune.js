import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'fortune';
export const label = 'Fortune cookie';

function uid() {
  return 'fc_' + Math.random().toString(36).slice(2, 9);
}

function cookieHalf(ns, side) {
  const flip = side === 'right';
  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;width:150px;height:118px;top:50%;' +
    (flip ? 'left:50%;' : 'right:50%;') +
    'margin-top:-59px;' +
    (flip ? 'margin-left:-4px;' : 'margin-right:-4px;') +
    'transform-origin:' + (flip ? '0% 70%' : '100% 70%') + ';' +
    'transition:transform 0.55s cubic-bezier(0.2,0.8,0.2,1), opacity 0.45s;';
  el.innerHTML =
    '<svg viewBox="0 0 150 118" width="150" height="118" aria-hidden="true" style="' +
      (flip ? 'transform:scaleX(-1);' : '') + '">' +
      '<defs>' +
        '<linearGradient id="' + ns + '_' + side + '" x1="10%" y1="10%" x2="80%" y2="90%">' +
          '<stop offset="0%" stop-color="#ffe2a8"/>' +
          '<stop offset="55%" stop-color="#e0a24a"/>' +
          '<stop offset="100%" stop-color="#8a5014"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M142 78 C120 28 70 8 18 42 C8 50 14 70 34 78 C70 92 118 96 142 78 Z" ' +
        'fill="url(#' + ns + '_' + side + ')" stroke="#1b110a" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<path d="M34 76 C70 88 112 86 136 74" fill="none" stroke="#6a3810" stroke-width="2" opacity="0.35"/>' +
      '<path d="M48 52 C70 40 96 44 112 58" fill="none" stroke="#fff3d0" stroke-width="3" opacity="0.35" stroke-linecap="round"/>' +
    '</svg>';
  return el;
}

/** Cookie rattles, then splits so a slip of paper names the pick. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #3a140c 0%, #0c0604 72%)';
  const winner = order[targetIndex];
  const ns = uid();

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + ns + '_shake {' +
      '0%,100% { transform: rotate(-8deg); }' +
      '50% { transform: rotate(8deg); }' +
    '}' +
    '@keyframes ' + ns + '_slip {' +
      'from { transform: translate(-50%, 28px) scale(0.7); opacity:0 }' +
      'to { transform: translate(-50%, -8px) scale(1); opacity:1 }' +
    '}';
  document.head.appendChild(styleEl);

  const headline = document.createElement('div');
  headline.textContent = 'Fortune Cookie';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:520px;height:340px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 50% 30%,#5a2814 0%,#2a120a 62%,#140806 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Crack it open';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:14px;text-align:center;z-index:4;' +
    'font-family:"Rye","Times New Roman",serif;font-size:14px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  const cookie = document.createElement('div');
  cookie.style.cssText =
    'position:absolute;left:50%;top:54%;width:280px;height:140px;margin-left:-140px;margin-top:-70px;' +
    'transform-origin:50% 70%;animation:' + ns + '_shake 0.14s ease-in-out infinite;z-index:3;';

  const whole = document.createElement('div');
  whole.style.cssText =
    'position:absolute;left:50%;top:50%;width:210px;height:128px;margin-left:-105px;margin-top:-64px;' +
    'transition:opacity 0.2s;';
  whole.innerHTML =
    '<svg viewBox="0 0 210 128" width="210" height="128" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="' + ns + '_whole" x1="20%" y1="0%" x2="80%" y2="100%">' +
          '<stop offset="0%" stop-color="#ffe2a8"/>' +
          '<stop offset="50%" stop-color="#e0a24a"/>' +
          '<stop offset="100%" stop-color="#8a5014"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<path d="M18 78 C40 18 100 4 168 28 C198 42 206 70 178 86 C140 108 70 112 32 92 C10 80 8 88 18 78 Z" ' +
        'fill="url(#' + ns + '_whole)" stroke="#1b110a" stroke-width="3.4" stroke-linejoin="round"/>' +
      '<path d="M46 70 C90 92 150 88 182 70" fill="none" stroke="#6a3810" stroke-width="2.4" opacity="0.4"/>' +
      '<path d="M58 48 C96 28 140 34 164 56" fill="none" stroke="#fff3d0" stroke-width="4" opacity="0.35" stroke-linecap="round"/>' +
    '</svg>';

  const left = cookieHalf(ns, 'left');
  const right = cookieHalf(ns, 'right');
  left.style.opacity = '0';
  right.style.opacity = '0';
  cookie.appendChild(whole);
  cookie.appendChild(left);
  cookie.appendChild(right);
  stage.appendChild(cookie);

  const slip = document.createElement('div');
  slip.style.cssText =
    'position:absolute;left:50%;top:46%;transform:translate(-50%,0);opacity:0;z-index:2;' +
    'width:280px;background:#fbf4dd;border:3px solid #1b110a;border-radius:2px;padding:16px 18px;' +
    'display:flex;flex-direction:column;align-items:center;gap:8px;' +
    'box-shadow:6px 6px 0 #1b110a;';

  const img = document.createElement('img');
  img.src = winner.avatarUrl;
  img.alt = '';
  img.style.cssText =
    'width:54px;height:54px;border-radius:50%;object-fit:cover;border:3px solid #1b110a;';

  const fortuneText = document.createElement('div');
  fortuneText.textContent = winner.name;
  fortuneText.style.cssText =
    'font-family:"Fraunces",Georgia,serif;font-size:18px;font-style:italic;font-weight:700;' +
    'color:#1b110a;text-align:center;';

  const luckyNums = document.createElement('div');
  luckyNums.style.cssText =
    'font-family:"Fraunces",Georgia,serif;font-size:12px;letter-spacing:0.5px;color:#8a5a20;text-align:center;';
  luckyNums.textContent =
    'Lucky numbers · ' + Array.from({ length: 4 }, () => Math.floor(Math.random() * 90) + 10).join(' · ');

  slip.appendChild(img);
  slip.appendChild(fortuneText);
  slip.appendChild(luckyNums);
  stage.appendChild(slip);

  document.body.appendChild(overlay);

  const crackAt = Math.max(800, CONFIG.spinDuration - 1300);
  setTimeout(() => {
    cookie.style.animation = 'none';
    whole.style.opacity = '0';
    left.style.opacity = '0.55';
    right.style.opacity = '0.55';
    left.style.transform = 'rotate(-34deg) translate(-58px, 22px)';
    right.style.transform = 'rotate(34deg) translate(58px, 22px)';
    cookie.style.zIndex = '2';
    slip.style.zIndex = '6';
    slip.style.animation = ns + '_slip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    caption.textContent = 'Your fortune';
  }, crackAt);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 120);
}
