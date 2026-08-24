import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'fortune';
export const label = 'Fortune cookie';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];

    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;width:340px;height:280px;display:flex;align-items:center;justify-content:center;';

    const shakeName = `cookieShake_${Date.now()}`;
    const slideName = `paperSlideIn_${Date.now()}`;
    const styleEl = document.createElement('style');
    styleEl.textContent =
      `@keyframes ${shakeName} { from { transform: translate(-50%,-50%) rotate(-9deg); } to { transform: translate(-50%,-50%) rotate(9deg); } }` +
      `@keyframes ${slideName} { from { transform: translate(-50%,calc(-50% + 60px)) scale(0.6); opacity: 0; } to { transform: translate(-50%,-50%) scale(1); opacity: 1; } }`;
    document.head.appendChild(styleEl);

    const cookie = document.createElement('div');
    cookie.textContent = '🥠';
    cookie.style.cssText =
      `position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);` +
      `font-size:160px;line-height:1;animation:${shakeName} 0.13s ease-in-out infinite alternate;` +
      `transition:opacity 0.35s,transform 0.35s;`;
    stage.appendChild(cookie);

    const fortune = document.createElement('div');
    fortune.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;' +
      'background:#fffaf0;border:2px solid #d4af37;border-radius:8px;padding:18px 28px;' +
      'display:flex;flex-direction:column;align-items:center;gap:10px;' +
      'box-shadow:0 8px 20px rgba(0,0,0,0.4);font-family:Georgia,serif;color:#333;min-width:220px;';

    const fortuneImg = document.createElement('img');
    fortuneImg.src = winner.avatarUrl;
    fortuneImg.style.cssText = 'width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid #d4af37;';

    const fortuneText = document.createElement('div');
    fortuneText.textContent = winner.name;
    fortuneText.style.cssText = 'font-size:18px;font-style:italic;font-weight:700;text-align:center;';

    const luckyNums = document.createElement('div');
    luckyNums.style.cssText = 'font-size:11px;color:#888;letter-spacing:2px;';
    luckyNums.textContent = 'Lucky: ' + Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 10).join('  ');

    fortune.appendChild(fortuneImg);
    fortune.appendChild(fortuneText);
    fortune.appendChild(luckyNums);
    stage.appendChild(fortune);

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Crack open ~600ms before the spin window ends so the fortune is readable.
    const crackAt = Math.max(800, CONFIG.spinDuration - 1200);
    setTimeout(() => {
      cookie.style.animation = 'none';
      cookie.style.opacity = '0';
      cookie.style.transform = 'translate(-50%,-50%) scale(0.5) rotate(25deg)';
      fortune.style.animation = `${slideName} 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`;
    }, crackAt);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** F1 race: cars rip around a closed stadium-shaped track using CSS offset-path so each
   *  car follows the racing line and rotates to face the direction of motion. Each car gets
   *  its own concentric path (its "lane"), so cars never overlap. The winner runs exactly
   *  2 full laps so they land on the start/finish line; everyone else falls 2-22% short. */
