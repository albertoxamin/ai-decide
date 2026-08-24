import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'capybara';
export const label = 'Capybara tub';

const FUR = ['#c9a36c', '#b8905c', '#d4b07a', '#a67c48', '#c4a060', '#9a7040'];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCapybara(person, i, size, uid) {
  const fur = FUR[i % FUR.length];
  const gid = uid + '_g' + i;
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:' + size + 'px;height:' + Math.round(size * 0.86) + 'px;z-index:6;' +
    'transform-origin:50% 70%;' +
    'transition:transform 0.7s cubic-bezier(0.35,-0.3,0.7,1.1), opacity 0.4s, filter 0.4s;';

  const inner = document.createElement('div');
  inner.style.cssText = 'position:absolute;inset:0;';
  inner.innerHTML =
    '<svg viewBox="0 0 140 120" width="100%" height="100%" aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="' + gid + '" cx="38%" cy="30%" r="70%">' +
          '<stop offset="0%" stop-color="' + fur + '"/>' +
          '<stop offset="100%" stop-color="#5a3a18"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<ellipse cx="32" cy="28" rx="12" ry="16" fill="#6a4420" stroke="#1b110a" stroke-width="3"/>' +
      '<ellipse cx="108" cy="28" rx="12" ry="16" fill="#6a4420" stroke="#1b110a" stroke-width="3"/>' +
      '<ellipse cx="32" cy="30" rx="6" ry="8" fill="#c48a78"/>' +
      '<ellipse cx="108" cy="30" rx="6" ry="8" fill="#c48a78"/>' +
      '<ellipse cx="70" cy="78" rx="58" ry="34" fill="url(#' + gid + ')" stroke="#1b110a" stroke-width="3.5"/>' +
      '<ellipse cx="70" cy="52" rx="48" ry="36" fill="url(#' + gid + ')" stroke="#1b110a" stroke-width="3.5"/>' +
      '<rect x="38" y="58" width="64" height="36" rx="16" fill="' + fur + '" stroke="#1b110a" stroke-width="3.5"/>' +
      '<ellipse cx="56" cy="78" rx="5" ry="4" fill="#1b110a"/>' +
      '<ellipse cx="84" cy="78" rx="5" ry="4" fill="#1b110a"/>' +
      '<path d="M60 88 Q70 94 80 88" fill="none" stroke="#1b110a" stroke-width="2.5" stroke-linecap="round"/>' +
      '<ellipse cx="22" cy="92" rx="12" ry="8" fill="' + fur + '" stroke="#1b110a" stroke-width="3"/>' +
      '<ellipse cx="118" cy="92" rx="12" ry="8" fill="' + fur + '" stroke="#1b110a" stroke-width="3"/>' +
    '</svg>';

  const faceSize = Math.round(size * 0.34);
  const face = document.createElement('img');
  face.src = person.avatarUrl;
  face.alt = '';
  face.style.cssText =
    'position:absolute;left:50%;top:18%;width:' + faceSize + 'px;height:' + faceSize + 'px;' +
    'margin-left:-' + faceSize / 2 + 'px;border-radius:50%;object-fit:cover;' +
    'border:3px solid #1b110a;background:#fbf4dd;z-index:4;' +
    'box-shadow:0 2px 0 rgba(0,0,0,0.25);';
  inner.appendChild(face);

  const soak = document.createElement('div');
  soak.style.cssText =
    'position:absolute;left:4%;right:4%;bottom:0;height:36%;pointer-events:none;z-index:5;' +
    'background:linear-gradient(180deg,transparent,rgba(70,150,168,0.55));' +
    'border-radius:0 0 48% 48%;';
  inner.appendChild(soak);

  const tag = document.createElement('div');
  tag.textContent = String(person.name).slice(0, 10);
  tag.style.cssText =
    'position:absolute;left:50%;top:-14px;transform:translateX(-50%);z-index:6;' +
    'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#fbf4dd;' +
    'text-shadow:0 1px 3px #000, 0 0 6px #000;white-space:nowrap;pointer-events:none;';
  inner.appendChild(tag);

  wrap.appendChild(inner);
  wrap._bob = inner;
  return wrap;
}

function placeInTub(n) {
  const back = Math.ceil(n / 2);
  const front = n - back;
  const spots = [];
  function row(count, ny, spread) {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : 0.18 + (i / (count - 1)) * 0.64;
      spots.push({ nx: 0.5 + (t - 0.5) * spread, ny: ny + (i % 2) * 0.03 });
    }
  }
  row(back, 0.34, 1.05);
  if (front > 0) row(front, 0.58, 0.88);
  return spots;
}

/** Capybara onsen: wooden ofuro, soaking avatar-faced capybaras, steam and yuzu.
 *  Non-winners hop out one by one; the winner stays in the tub with a contented sigh. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const n = order.length;
  const uid = 'capy_' + Date.now();

  const stageW = 640;
  const stageH = 440;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#87a8b8 0%,#c8ddd0 36%,#6a9a6e 58%,#3a5a38 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + uid + '_steam {' +
    '  0% { transform:translateY(0) scale(1); opacity:0.5; }' +
    '  100% { transform:translateY(-100px) scale(1.9); opacity:0; }' +
    '}' +
    '@keyframes ' + uid + '_bob {' +
    '  0%,100% { transform:translateY(0); }' +
    '  50% { transform:translateY(-6px); }' +
    '}';
  document.head.appendChild(styleEl);

  const mountain = document.createElement('div');
  mountain.style.cssText =
    'position:absolute;left:-30px;top:40px;width:300px;height:180px;' +
    'background:linear-gradient(180deg,#5a7380,#2c4048);' +
    'clip-path:polygon(0 100%,10% 42%,24% 64%,40% 16%,56% 52%,74% 24%,100% 100%);';
  stage.appendChild(mountain);

  const mountain2 = document.createElement('div');
  mountain2.style.cssText =
    'position:absolute;right:-16px;top:64px;width:260px;height:150px;' +
    'background:linear-gradient(180deg,#6a8490,#354850);' +
    'clip-path:polygon(0 100%,16% 36%,38% 58%,60% 20%,86% 48%,100% 100%);';
  stage.appendChild(mountain2);

  const snow = document.createElement('div');
  snow.style.cssText =
    'position:absolute;left:78px;top:40px;width:52px;height:30px;background:#f4f7fa;' +
    'clip-path:polygon(50% 0,100% 100%,0 100%);';
  stage.appendChild(snow);

  for (let b = 0; b < 5; b++) {
    const bamboo = document.createElement('div');
    bamboo.style.cssText =
      'position:absolute;left:' + (18 + b * 14) + 'px;bottom:0;width:10px;height:' + (90 + b * 18) + 'px;' +
      'background:linear-gradient(90deg,#8fbf5a,#3d6a28);border:2px solid #1b110a;z-index:1;' +
      'border-radius:4px;';
    bamboo.innerHTML =
      '<div style="position:absolute;left:-1px;right:-1px;top:28%;height:4px;background:#1b110a;"></div>' +
      '<div style="position:absolute;left:-1px;right:-1px;top:58%;height:4px;background:#1b110a;"></div>';
    stage.appendChild(bamboo);
  }

  const caption = document.createElement('div');
  caption.textContent = 'Onsen  ·  who stays in the tub?';
  caption.style.cssText =
    'position:absolute;left:80px;right:80px;top:10px;text-align:center;z-index:12;' +
    'font-family:"Rye","Times New Roman",serif;font-size:16px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a, 0 0 10px rgba(0,0,0,0.5);';
  stage.appendChild(caption);

  function lantern(side, color) {
    const el = document.createElement('div');
    el.style.cssText =
      'position:absolute;top:8px;' + side + ';width:34px;height:46px;z-index:11;';
    el.innerHTML =
      '<div style="position:absolute;left:50%;top:0;width:8px;height:10px;margin-left:-4px;background:#1b110a;"></div>' +
      '<div style="position:absolute;left:2px;top:8px;width:30px;height:34px;background:' + color + ';' +
      'border:3px solid #1b110a;border-radius:50%;box-shadow:0 0 14px ' + color + ';"></div>' +
      '<div style="position:absolute;left:8px;top:18px;right:8px;height:3px;background:#f6e27a;"></div>' +
      '<div style="position:absolute;left:50%;bottom:0;width:4px;height:8px;margin-left:-2px;background:#1b110a;"></div>';
    stage.appendChild(el);
  }
  lantern('left:16px', '#c83a1e');
  lantern('right:16px', '#d99a2b');

  const tubW = 500;
  const tubH = 248;
  const tubX = (stageW - tubW) / 2;
  const tubY = 132;
  const tub = document.createElement('div');
  tub.style.cssText =
    'position:absolute;left:' + tubX + 'px;top:' + tubY + 'px;width:' + tubW + 'px;height:' + tubH + 'px;' +
    'border-radius:50% / 44%;overflow:hidden;z-index:2;' +
    'background:linear-gradient(180deg,#a06a32 0%,#6e4418 45%,#3e240c 100%);' +
    'border:5px solid #1b110a;box-shadow:0 18px 0 #241408, 0 24px 28px rgba(0,0,0,0.45);';
  stage.appendChild(tub);

  for (let s = 0; s < 16; s++) {
    const stave = document.createElement('div');
    stave.style.cssText =
      'position:absolute;top:0;bottom:0;left:' + (s * (100 / 16)) + '%;width:6.4%;' +
      'background:linear-gradient(90deg,rgba(255,220,160,0.22),transparent 45%,rgba(0,0,0,0.2));' +
      'border-right:1px solid rgba(27,17,10,0.28);';
    tub.appendChild(stave);
  }

  ['20%', '58%'].forEach(function (top) {
    const band = document.createElement('div');
    band.style.cssText =
      'position:absolute;left:0;right:0;top:' + top + ';height:11px;z-index:2;' +
      'background:linear-gradient(180deg,#e0c060,#8a6418);border-top:2px solid #1b110a;' +
      'border-bottom:2px solid #1b110a;';
    tub.appendChild(band);
  });

  const water = document.createElement('div');
  water.style.cssText =
    'position:absolute;left:6%;right:6%;top:12%;bottom:14%;z-index:3;' +
    'background:radial-gradient(ellipse at 32% 28%,#e8f8fb 0%,#7ec8d4 42%,#2f7e8c 100%);' +
    'border-radius:50%;border:3px solid #1b110a;' +
    'box-shadow:inset 0 12px 16px rgba(255,255,255,0.35), inset 0 -16px 20px rgba(0,40,50,0.28);';
  tub.appendChild(water);

  for (let o = 0; o < 6; o++) {
    const yuzu = document.createElement('div');
    yuzu.style.cssText =
      'position:absolute;left:' + (14 + (o * 13) % 70) + '%;top:' + (18 + (o * 11) % 50) + '%;' +
      'width:18px;height:18px;z-index:4;border-radius:50%;border:2px solid #1b110a;' +
      'background:radial-gradient(circle at 32% 28%,#ffe98a,#e07010);' +
      'animation:' + uid + '_bob ' + (2 + o * 0.2) + 's ease-in-out ' + (o * 0.15) + 's infinite;';
    water.appendChild(yuzu);
  }

  for (let i = 0; i < 9; i++) {
    const steam = document.createElement('div');
    steam.style.cssText =
      'position:absolute;left:' + (tubX + 40 + i * 50) + 'px;top:' + (tubY + 4) + 'px;' +
      'width:48px;height:48px;border-radius:50%;pointer-events:none;z-index:9;' +
      'background:radial-gradient(circle,rgba(255,255,255,0.6),transparent 70%);' +
      'animation:' + uid + '_steam ' + (2.1 + (i % 3) * 0.35) + 's ease-out ' + (i * 0.22) + 's infinite;';
    stage.appendChild(steam);
  }

  [
    [tubX - 42, tubY + 158, 78],
    [tubX + tubW - 18, tubY + 168, 62],
    [tubX - 4, tubY + 198, 46],
    [tubX + tubW + 8, tubY + 198, 40],
  ].forEach(function (r) {
    const rock = document.createElement('div');
    rock.style.cssText =
      'position:absolute;left:' + r[0] + 'px;top:' + r[1] + 'px;width:' + r[2] + 'px;height:' +
      Math.round(r[2] * 0.52) + 'px;z-index:4;' +
      'background:linear-gradient(180deg,#9a9a92,#4e4e48);border:3px solid #1b110a;border-radius:50%;';
    stage.appendChild(rock);
  });

  const capySize = n > 10 ? 78 : n > 7 ? 92 : n > 4 ? 108 : 124;
  const layout = shuffle(order.map((_, i) => i));
  const winnerVisualIdx = layout.indexOf(targetIndex);
  const spots = placeInTub(n);
  const capyEls = [];

  layout.forEach(function (orderIdx, visualIdx) {
    const capy = makeCapybara(order[orderIdx], orderIdx, capySize, uid);
    const spot = spots[visualIdx];
    const x = tubX + spot.nx * tubW - capySize / 2;
    const y = tubY + spot.ny * tubH - capySize * 0.42;
    capy.style.left = x + 'px';
    capy.style.top = y + 'px';
    capy.style.zIndex = String(6 + Math.round(spot.ny * 12));
    capy._bob.style.animation = uid + '_bob ' + (2.3 + (visualIdx % 4) * 0.28) + 's ease-in-out ' +
      (visualIdx * 0.12) + 's infinite';
    stage.appendChild(capy);
    capyEls.push(capy);
  });

  document.body.appendChild(overlay);

  const exitOrder = shuffle(capyEls.map((_, i) => i).filter((i) => i !== winnerVisualIdx));
  const stepMs = (CONFIG.spinDuration - 1100) / Math.max(1, exitOrder.length);

  exitOrder.forEach(function (idx, nStep) {
    setTimeout(function () {
      const capy = capyEls[idx];
      capy._bob.style.animation = 'none';
      const dir = nStep % 2 === 0 ? -1 : 1;
      const dx = dir * (340 + Math.random() * 90);
      const dy = -80 - Math.random() * 120;
      const spin = dir * (200 + Math.random() * 220);
      capy.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + spin + 'deg) scale(0.75)';
      capy.style.opacity = '0';
    }, 700 + nStep * stepMs);
  });

  setTimeout(function () {
    caption.textContent = 'Ahhh~';
    const winnerCapy = capyEls[winnerVisualIdx];
    winnerCapy._bob.style.animation = 'none';
    winnerCapy.style.transform = 'scale(1.18)';
    winnerCapy.style.zIndex = '20';
    winnerCapy.style.filter = 'drop-shadow(0 0 14px rgba(246,226,122,0.9))';

    const bubble = document.createElement('div');
    bubble.textContent = 'ahhhh~ \uD83D\uDE0C';
    bubble.style.cssText =
      'position:absolute;background:#fbf4dd;color:#1b110a;padding:6px 12px;border-radius:14px;' +
      'font-size:14px;font-weight:700;border:3px solid #1b110a;z-index:21;' +
      'box-shadow:3px 3px 0 #1b110a;bottom:100%;left:50%;transform:translateX(-50%) translateY(-4px);' +
      'white-space:nowrap;font-family:"Fraunces",Georgia,serif;';
    winnerCapy.appendChild(bubble);
  }, CONFIG.spinDuration - 280);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 100);
}
