import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'pinata';
export const label = 'Pi\u00f1ata';

/** A bat swings, the piñata bursts, candy-avatars fly; the winner lands in the loot bowl. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const totalMs = Math.max(CONFIG.spinDuration, 3000);
  const swingMs = Math.max(700, Math.round(totalMs * 0.28));
  const burstMs = Math.max(900, Math.round(totalMs * 0.42));
  const holdMs = Math.max(400, totalMs - swingMs - burstMs);

  const headline = document.createElement('div');
  headline.textContent = 'Pi\u00f1ata';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 560;
  const stageH = 390;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#1a3a5c 0%,#0c1a2c 55%,#2a1810 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Take a swing\u2026';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:12px;text-align:center;z-index:8;' +
    'font-family:"Fraunces",Georgia,serif;font-size:14px;font-style:italic;color:#fbf4dd;';
  stage.appendChild(caption);

  const rope = document.createElement('div');
  rope.style.cssText =
    'position:absolute;left:50%;top:8px;width:3px;height:70px;margin-left:-1px;background:#d9c48a;';
  stage.appendChild(rope);

  const pinata = document.createElement('div');
  pinata.style.cssText =
    'position:absolute;left:50%;top:70px;width:90px;height:90px;margin-left:-45px;' +
    'border-radius:46% 46% 40% 40%;' +
    'background:conic-gradient(#e81dbb,#ffcc00,#0cc846,#007aff,#e81dbb);' +
    'border:3px solid #1b110a;z-index:4;' +
    'transition:transform 0.25s, opacity 0.35s;transform-origin:50% -70px;';
  const pinataFace = document.createElement('img');
  pinataFace.src = winner.avatarUrl;
  pinataFace.style.cssText =
    'position:absolute;left:50%;top:50%;width:42px;height:42px;margin:-21px 0 0 -21px;' +
    'border-radius:50%;object-fit:cover;border:2px solid #fff;';
  pinata.appendChild(pinataFace);
  stage.appendChild(pinata);

  const bat = document.createElement('div');
  bat.style.cssText =
    'position:absolute;left:70px;top:40px;width:160px;height:18px;z-index:6;' +
    'background:linear-gradient(90deg,#6b3a18,#d9a24a);border:2px solid #1b110a;border-radius:8px;' +
    'transform-origin:8px 50%;transform:rotate(-50deg);' +
    'transition:transform 0.45s cubic-bezier(0.6,0.1,0.3,1.4);';
  stage.appendChild(bat);

  const bowl = document.createElement('div');
  bowl.style.cssText =
    'position:absolute;left:50%;bottom:18px;width:160px;height:36px;margin-left:-80px;' +
    'background:linear-gradient(180deg,#c83a1e,#6a1810);border:3px solid #1b110a;border-radius:0 0 40px 40px;z-index:3;';
  stage.appendChild(bowl);

  const candies = order.map(function (person, i) {
    const el = document.createElement('img');
    el.src = person.avatarUrl;
    el.style.cssText =
      'position:absolute;left:50%;top:100px;width:36px;height:36px;margin-left:-18px;' +
      'border-radius:50%;object-fit:cover;border:2px solid #fff;z-index:5;opacity:0;' +
      'transition:left 0.7s cubic-bezier(0.2,0.8,0.4,1), top 0.7s cubic-bezier(0.55,0.1,0.7,1.1), opacity 0.3s, filter 0.4s, transform 0.4s;';
    stage.appendChild(el);
    return el;
  });

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes pinataWobble { 0%,100% { transform: rotate(-8deg); } 50% { transform: rotate(10deg); } }';
  document.head.appendChild(styleEl);
  pinata.style.animation = 'pinataWobble 0.7s ease-in-out infinite';

  document.body.appendChild(overlay);

  setTimeout(function () {
    bat.style.transform = 'rotate(28deg)';
    caption.textContent = 'CRACK';
  }, swingMs);

  setTimeout(function () {
    pinata.style.opacity = '0';
    pinata.style.transform = 'scale(1.4)';
    pinata.style.animation = 'none';
    candies.forEach(function (el, i) {
      el.style.opacity = '1';
      const isWin = i === targetIndex;
      const angle = ((i / order.length) * Math.PI * 2) - Math.PI / 2;
      if (isWin) {
        el.style.left = '50%';
        el.style.top = stageH - 86 + 'px';
        el.style.transform = 'scale(1.35)';
        el.style.zIndex = '8';
      } else {
        el.style.left = 50 + Math.cos(angle) * 38 + '%';
        el.style.top = 240 + Math.sin(angle) * 40 + 'px';
        el.style.filter = 'grayscale(1)';
        el.style.opacity = '0.45';
        el.style.transform = 'scale(0.75) rotate(' + (Math.random() * 40 - 20) + 'deg)';
      }
    });
    caption.textContent = winner.name + ' spills out';
  }, swingMs + 280);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, swingMs + burstMs + holdMs);
}
