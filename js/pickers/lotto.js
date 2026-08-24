import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'lotto';
export const label = 'Lotto';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const drumSize = 320;
    const ballSize = 54;

    const drum = document.createElement('div');
    drum.style.cssText =
      `position:relative;width:${drumSize}px;height:${drumSize}px;border-radius:50%;` +
      `border:8px solid #333;background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(255,255,255,0.02));` +
      `box-shadow:0 0 40px rgba(0,0,0,0.6),inset 0 0 40px rgba(0,0,0,0.55);overflow:hidden;`;
    overlay.appendChild(drum);

    const tray = document.createElement('div');
    tray.style.cssText =
      'width:280px;min-height:80px;border:4px solid #333;border-radius:14px;' +
      'background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;gap:12px;' +
      'color:#fff;font-size:18px;font-weight:600;opacity:0.6;transition:opacity 0.3s,background 0.3s;padding:10px 16px;';
    tray.textContent = '...';
    overlay.appendChild(tray);

    const ballColors = ['#ff3b30','#ff9500','#ffcc00','#34c759','#007aff','#5856d6','#af52de','#ff2d55','#0cc846','#e81dbb'];
    const ballEls = [];
    const styleEl = document.createElement('style');
    document.head.appendChild(styleEl);

    order.forEach((person, i) => {
      const ball = document.createElement('div');
      const color = ballColors[i % ballColors.length];
      const startX = Math.random() * (drumSize - ballSize);
      const startY = Math.random() * (drumSize - ballSize);
      const dx = (Math.random() - 0.5) * 80;
      const dy = (Math.random() - 0.5) * 80;
      const dur = 0.45 + Math.random() * 0.4;
      const delay = Math.random() * 0.3;
      const animName = `lottoBounce_${Date.now()}_${i}`;

      styleEl.textContent +=
        `@keyframes ${animName} { from { transform: translate(0,0) rotate(0deg); }` +
        ` to { transform: translate(${dx}px, ${dy}px) rotate(${(Math.random() - 0.5) * 60}deg); } }`;

      ball.style.cssText =
        `position:absolute;left:${startX}px;top:${startY}px;width:${ballSize}px;height:${ballSize}px;` +
        `border-radius:50%;background:radial-gradient(circle at 30% 30%, #fff, ${color} 60%, ${color} 100%);` +
        `box-shadow:0 4px 10px rgba(0,0,0,0.4),inset -4px -4px 8px rgba(0,0,0,0.25);` +
        `display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid rgba(255,255,255,0.6);` +
        `animation:${animName} ${dur}s ease-in-out ${delay}s infinite alternate;`;

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = `width:${ballSize - 14}px;height:${ballSize - 14}px;border-radius:50%;object-fit:cover;`;
      ball.appendChild(img);

      drum.appendChild(ball);
      ballEls.push(ball);
    });

    document.body.appendChild(overlay);

    // After ~80% of the spin, eject the winning ball into the tray.
    const dropAt = Math.max(800, CONFIG.spinDuration - 700);
    setTimeout(() => {
      const winnerBall = ballEls[targetIndex];
      ballEls.forEach((b, i) => {
        if (i !== targetIndex) {
          b.style.transition = 'opacity 0.4s';
          b.style.opacity = '0.18';
        }
      });
      if (winnerBall) {
        const trayRect = tray.getBoundingClientRect();
        const ballRect = winnerBall.getBoundingClientRect();
        const dx = (trayRect.left + trayRect.width / 2) - (ballRect.left + ballRect.width / 2);
        const dy = (trayRect.top + trayRect.height / 2) - (ballRect.top + ballRect.height / 2);
        // Let the ball escape the drum's clip on the way out.
        drum.style.overflow = 'visible';
        winnerBall.style.zIndex = '10';
        winnerBall.style.animation = 'none';
        winnerBall.style.transition = 'transform 0.55s cubic-bezier(0.5, -0.2, 0.7, 0.1)';
        winnerBall.style.transform = `translate(${dx}px, ${dy}px) scale(1.35)`;
      }
      setTimeout(() => {
        const winner = order[targetIndex];
        tray.textContent = '';
        const trayImg = document.createElement('img');
        trayImg.src = winner.avatarUrl;
        trayImg.style.cssText = 'width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #fff;';
        const trayName = document.createElement('span');
        trayName.textContent = winner.name;
        tray.appendChild(trayImg);
        tray.appendChild(trayName);
        tray.style.opacity = '1';
        tray.style.background = 'rgba(255,255,255,0.18)';
      }, 550);
    }, dropAt);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Slot machine: 3 vertical reels of avatars roll past, all three lock onto the winner.
   *  Reels stop at staggered times for a satisfying "ka-chunk ka-chunk ka-chunk" feel. */
