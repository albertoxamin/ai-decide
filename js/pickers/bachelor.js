import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'bachelor';
export const label = 'Bachelor rose';

const GOWNS = ['#f7c8d4', '#e8d5a8', '#c8b8e8', '#9ad4e8', '#f4b4c8', '#d4e8c8'];

function makeRose(size) {
  const el = document.createElement('div');
  el.style.cssText = 'position:relative;width:' + size + 'px;height:' + (size * 2.1) + 'px;z-index:8;';
  el.innerHTML =
    '<div style="position:absolute;left:50%;bottom:0;width:4px;height:' + (size * 1.15) + 'px;margin-left:-2px;' +
    'background:linear-gradient(#2c5d32,#1a3a1e);border-radius:2px;"></div>' +
    '<div style="position:absolute;left:50%;bottom:' + (size * 0.55) + 'px;width:14px;height:8px;margin-left:-2px;' +
    'background:#2c5d32;border-radius:0 8px 0 8px;transform:rotate(-25deg);"></div>' +
    '<div style="position:absolute;left:50%;top:0;width:' + size + 'px;height:' + size + 'px;margin-left:-' + size / 2 + 'px;' +
    'border-radius:50% 50% 50% 0;background:radial-gradient(circle at 35% 35%,#ff6b8a,#c81e3a 70%,#7a1020);' +
    'transform:rotate(-45deg);border:2px solid #4a0810;box-shadow:0 4px 10px rgba(0,0,0,0.4);"></div>';
  return el;
}

function makeContestant(person, i) {
  const gown = GOWNS[i % GOWNS.length];
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:72px;height:150px;z-index:5;' +
    'display:flex;flex-direction:column;align-items:center;' +
    'transition:left 0.55s cubic-bezier(0.4,0.1,0.2,1), bottom 0.55s cubic-bezier(0.4,0.1,0.2,1),' +
    'filter 0.45s, opacity 0.45s, transform 0.45s;';
  wrap.innerHTML =
    '<div style="position:absolute;bottom:18px;width:54px;height:78px;' +
    'background:linear-gradient(180deg,' + gown + ',#5a2030);border:2px solid #1b110a;' +
    'border-radius:22px 22px 8px 8px;clip-path:polygon(18% 0,82% 0,100% 100%,0 100%);"></div>';
  const img = document.createElement('img');
  img.src = person.avatarUrl;
  img.style.cssText =
    'position:absolute;top:0;width:44px;height:44px;border-radius:50%;object-fit:cover;' +
    'border:3px solid #f7c8d4;box-shadow:0 4px 10px rgba(0,0,0,0.5);z-index:2;' +
    'transition:border-color 0.3s, box-shadow 0.3s;';
  wrap.appendChild(img);
  const nm = document.createElement('div');
  nm.textContent = String(person.name).slice(0, 9);
  nm.style.cssText =
    'position:absolute;bottom:0;font-size:10px;color:#f7c8d4;font-weight:700;' +
    'text-shadow:0 1px 2px #000;white-space:nowrap;';
  wrap.appendChild(nm);
  return { wrap: wrap, img: img };
}

/** Mansion rose ceremony: host, gowns, spotlight. Losers hear "I'm sorry";
 *  the last contestant is offered the final rose. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const CALL_MS = 780;
  const offerMs = 1100;
  const holdMs = 700;

  const headline = document.createElement('div');
  headline.textContent = 'The Final Rose';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f7c8d4;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 640;
  const stageH = 420;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#1a0814 0%,#3a1028 45%,#12080c 100%);' +
    'border:5px solid #6a1830;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'The rose ceremony is about to begin';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:12px;text-align:center;z-index:10;' +
    'font-family:"Fraunces",Georgia,serif;font-size:15px;font-style:italic;color:#f7c8d4;' +
    'text-shadow:0 2px 0 #000;';
  stage.appendChild(caption);

  // String lights
  for (let i = 0; i < 14; i++) {
    const bulb = document.createElement('div');
    bulb.style.cssText =
      'position:absolute;top:' + (28 + (i % 2) * 8) + 'px;left:' + (24 + i * 44) + 'px;' +
      'width:8px;height:8px;border-radius:50%;background:#f6e27a;box-shadow:0 0 10px #f6e27a;z-index:2;';
    stage.appendChild(bulb);
  }

  // Mansion silhouette
  const house = document.createElement('div');
  house.style.cssText =
    'position:absolute;right:12px;top:52px;width:150px;height:90px;z-index:1;' +
    'background:#12080c;border:2px solid #3a2030;clip-path:polygon(0 40%,20% 40%,20% 0,50% 0,50% 40%,100% 40%,100% 100%,0 100%);';
  house.innerHTML =
    '<div style="position:absolute;left:28px;top:50px;width:14px;height:18px;background:#f6e27a;opacity:0.7;"></div>' +
    '<div style="position:absolute;left:70px;top:50px;width:14px;height:18px;background:#f6e27a;opacity:0.55;"></div>';
  stage.appendChild(house);

  const spot = document.createElement('div');
  spot.style.cssText =
    'position:absolute;width:140px;height:220px;top:80px;left:40px;z-index:2;pointer-events:none;' +
    'background:radial-gradient(ellipse at 50% 80%, rgba(255,220,180,0.28), transparent 70%);' +
    'transition:left 0.5s ease, opacity 0.4s;opacity:0.4;';
  stage.appendChild(spot);

  // Host
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:36px;bottom:36px;width:70px;height:160px;z-index:6;';
  host.innerHTML =
    '<div style="position:absolute;bottom:16px;left:12px;width:46px;height:90px;' +
    'background:linear-gradient(180deg,#2a2a32,#0a0a10);border:2px solid #1b110a;border-radius:8px 8px 4px 4px;"></div>' +
    '<div style="position:absolute;top:8px;left:50%;width:36px;height:36px;margin-left:-18px;border-radius:50%;' +
    'background:linear-gradient(#e8e0d0,#c8c0b0);border:2px solid #1b110a;"></div>' +
    '<div style="position:absolute;top:0;left:50%;width:40px;height:14px;margin-left:-20px;border-radius:8px 8px 0 0;' +
    'background:#c8c8d0;border:2px solid #1b110a;"></div>';
  stage.appendChild(host);

  const rose = makeRose(28);
  rose.style.cssText += 'position:absolute;left:78px;bottom:92px;transition:left 0.5s ease, bottom 0.5s ease, transform 0.4s;';
  stage.appendChild(rose);

  const n = order.length;
  const slotW = Math.min(78, Math.floor((stageW - 160) / n));
  const rowLeft = 150 + Math.max(0, (stageW - 160 - slotW * n) / 2);
  const contestants = order.map(function (person, i) {
    const c = makeContestant(person, i);
    c.homeX = rowLeft + i * slotW;
    c.wrap.style.left = c.homeX + 'px';
    c.wrap.style.bottom = '28px';
    stage.appendChild(c.wrap);
    return c;
  });

  const sorryCard = document.createElement('div');
  sorryCard.textContent = "I'm sorry.";
  sorryCard.style.cssText =
    'position:absolute;left:50%;top:70px;transform:translateX(-50%) scale(0.6);opacity:0;z-index:11;' +
    'padding:8px 22px;background:#1b110a;color:#f7c8d4;border:2px solid #f7c8d4;border-radius:6px;' +
    'font-family:"Fraunces",Georgia,serif;font-style:italic;font-size:18px;' +
    'transition:opacity 0.25s, transform 0.35s cubic-bezier(0.3,1.5,0.5,1);';
  stage.appendChild(sorryCard);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes petalFall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 0.9; } ' +
    '100% { transform: translateY(440px) rotate(240deg); opacity: 0; } }' +
    '@keyframes rosePulse { 0%,100% { filter: drop-shadow(0 0 4px rgba(200,30,58,0.4)); } ' +
    '50% { filter: drop-shadow(0 0 16px rgba(255,80,120,0.95)); } }';
  document.head.appendChild(styleEl);

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.style.cssText =
      'position:absolute;left:' + (Math.random() * 90 + 5) + '%;top:-16px;width:10px;height:8px;z-index:9;' +
      'background:radial-gradient(circle at 30% 30%,#ff6b8a,#c81e3a);border-radius:50% 0 50% 50%;' +
      'animation:petalFall ' + (4 + Math.random() * 3).toFixed(1) + 's linear ' + (Math.random() * 3).toFixed(1) + 's infinite;';
    stage.appendChild(p);
  }

  document.body.appendChild(overlay);

  const losers = order.map(function (_, i) { return i; }).filter(function (i) { return i !== targetIndex; });
  for (let i = losers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = losers[i];
    losers[i] = losers[j];
    losers[j] = tmp;
  }

  const markX = 200;

  losers.forEach(function (idx, n) {
    setTimeout(function () {
      const c = contestants[idx];
      caption.textContent = order[idx].name + '\u2026';
      spot.style.opacity = '1';
      spot.style.left = c.homeX - 34 + 'px';
      c.wrap.style.left = markX + 'px';
      c.wrap.style.bottom = '48px';
      c.img.style.borderColor = '#fff';
      sorryCard.style.opacity = '0';
      sorryCard.style.transform = 'translateX(-50%) scale(0.6)';
      setTimeout(function () {
        sorryCard.style.opacity = '1';
        sorryCard.style.transform = 'translateX(-50%) scale(1)';
        caption.textContent = "I'm sorry, " + order[idx].name;
        c.wrap.style.filter = 'grayscale(1)';
        c.wrap.style.opacity = '0.28';
        c.wrap.style.left = c.homeX + 'px';
        c.wrap.style.bottom = '28px';
        c.img.style.borderColor = '#666';
        setTimeout(function () {
          sorryCard.style.opacity = '0';
        }, 280);
      }, 420);
    }, 400 + n * CALL_MS);
  });

  const finalAt = 400 + losers.length * CALL_MS + 200;
  setTimeout(function () {
    const c = contestants[targetIndex];
    caption.textContent = winner.name + '\u2026';
    spot.style.left = markX - 34 + 'px';
    spot.style.opacity = '1';
    c.wrap.style.left = markX + 'px';
    c.wrap.style.bottom = '56px';
    c.wrap.style.transform = 'scale(1.08)';
    c.img.style.borderColor = '#fff';
    contestants.forEach(function (o, i) {
      if (i !== targetIndex) {
        o.wrap.style.opacity = '0.22';
        o.wrap.style.filter = 'grayscale(1)';
      }
    });
  }, finalAt);

  setTimeout(function () {
    caption.textContent = 'Will you accept this rose?';
    rose.style.animation = 'rosePulse 0.8s ease-in-out infinite';
    rose.style.left = '168px';
    rose.style.bottom = '120px';
    rose.style.transform = 'scale(1.25) rotate(-12deg)';
  }, finalAt + 450);

  setTimeout(function () {
    rose.style.left = markX + 48 + 'px';
    rose.style.bottom = '118px';
    contestants[targetIndex].img.style.borderColor = '#ff4d6d';
    contestants[targetIndex].img.style.boxShadow = '0 0 22px rgba(255,80,120,0.95)';
    caption.textContent = winner.name + '  \u2014  I accept.';
  }, finalAt + offerMs);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, finalAt + offerMs + holdMs);
}
