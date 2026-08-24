import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'jenga';
export const label = 'Jenga';

const WOOD = [
  ['#f3ddb2', '#c48a38'],
  ['#ead08a', '#a86a20'],
  ['#f7e6c0', '#b87a26'],
  ['#e0c47a', '#8a5816'],
  ['#efd498', '#c49a44'],
];

function makeBlock(w, h, shadeI, grainAcross) {
  const [hi, lo] = WOOD[shadeI % WOOD.length];
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:' + w + 'px;height:' + h + 'px;' +
    'transition:transform 0.55s cubic-bezier(0.55,0.05,0.85,1.05), opacity 0.4s, filter 0.4s;';

  const depth = 8;
  const side = document.createElement('div');
  side.style.cssText =
    'position:absolute;right:' + -depth + 'px;top:3px;width:' + depth + 'px;height:' + (h - 2) + 'px;' +
    'background:linear-gradient(90deg,' + lo + ',#5a3010);border:2px solid #1b110a;border-left:none;' +
    'transform:skewY(-18deg);transform-origin:0 0;box-sizing:border-box;';

  const top = document.createElement('div');
  top.style.cssText =
    'position:absolute;left:3px;top:' + -depth + 'px;width:' + (w - 2) + 'px;height:' + depth + 'px;' +
    'background:linear-gradient(180deg,#f8e8c4,' + hi + ');border:2px solid #1b110a;border-bottom:none;' +
    'transform:skewX(-18deg);transform-origin:0 100%;box-sizing:border-box;';

  const face = document.createElement('div');
  face.style.cssText =
    'position:absolute;inset:0;overflow:hidden;border:2px solid #1b110a;border-radius:2px;box-sizing:border-box;' +
    'background:' + (grainAcross
      ? 'repeating-linear-gradient(90deg,' + hi + ' 0 7px,' + lo + ' 7px 9px)'
      : 'linear-gradient(180deg,' + hi + ' 0%,' + lo + ' 58%,#6a4010 100%)') + ';' +
    'box-shadow:inset 0 1px 0 rgba(255,255,255,0.4), 2px 4px 0 rgba(0,0,0,0.35);';
  const shade = document.createElement('div');
  shade.style.cssText =
    'position:absolute;left:0;top:0;bottom:0;width:8px;' +
    'background:linear-gradient(90deg,rgba(0,0,0,0.28),transparent);pointer-events:none;';
  face.appendChild(shade);

  wrap.appendChild(side);
  wrap.appendChild(top);
  wrap.appendChild(face);
  wrap._face = face;
  return wrap;
}

/** Living-room Jenga: 3D crossed tower on a table. A peg pulls loser bricks;
 *  the named brick still in the stack is the pick. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const n = order.length;
  const PULL_MS = 820;
  const holdMs = 850;

  const headline = document.createElement('div');
  headline.textContent = 'Jenga';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:26px;letter-spacing:5px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 640;
  const stageH = 440;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 28% 8%,#6a4420 0%,#2a1810 42%,#120c08 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'One brick at a time\u2026';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:12px;text-align:center;z-index:12;' +
    'font-family:"Fraunces",Georgia,serif;font-size:15px;font-style:italic;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #000;';
  stage.appendChild(caption);

  const lamp = document.createElement('div');
  lamp.style.cssText =
    'position:absolute;right:40px;top:44px;width:80px;height:100px;z-index:1;' +
    'background:radial-gradient(circle at 50% 82%,rgba(255,210,120,0.5),transparent 70%);';
  lamp.innerHTML =
    '<div style="position:absolute;left:50%;top:6px;width:8px;height:24px;margin-left:-4px;background:#3a2a18;border:2px solid #1b110a;"></div>' +
    '<div style="position:absolute;left:50%;top:26px;width:52px;height:30px;margin-left:-26px;' +
    'background:#f6e27a;border:2px solid #1b110a;clip-path:polygon(18% 0,82% 0,100% 100%,0 100%);' +
    'box-shadow:0 14px 32px rgba(246,226,122,0.5);"></div>';
  stage.appendChild(lamp);

  const table = document.createElement('div');
  table.style.cssText =
    'position:absolute;left:48px;right:48px;bottom:0;height:86px;z-index:2;' +
    'background:linear-gradient(180deg,#7a4e28 0%,#4a2c14 38%,#241408 100%);' +
    'border-top:5px solid #1b110a;box-shadow:inset 0 10px 0 rgba(255,220,160,0.1);';
  table.innerHTML =
    '<div style="position:absolute;left:28px;bottom:-18px;width:16px;height:22px;background:#3a2410;border:2px solid #1b110a;"></div>' +
    '<div style="position:absolute;right:28px;bottom:-18px;width:16px;height:22px;background:#3a2410;border:2px solid #1b110a;"></div>';
  stage.appendChild(table);

  const bw = n > 8 ? 50 : 58;
  const bh = n > 8 ? 17 : 21;
  const layers = Math.max(6, Math.ceil(n / 3) + 1);
  const towerW = bw * 3;
  const towerH = layers * (bh + 2);
  const originX = Math.round((stageW - towerW) / 2) - 4;
  const originY = stageH - 86 - towerH;

  const shadow = document.createElement('div');
  shadow.style.cssText =
    'position:absolute;left:' + (originX - 8) + 'px;top:' + (originY + towerH - 6) + 'px;' +
    'width:' + (towerW + 24) + 'px;height:18px;z-index:3;' +
    'background:radial-gradient(ellipse at 50% 40%,rgba(0,0,0,0.55),transparent 70%);';
  stage.appendChild(shadow);

  const tower = document.createElement('div');
  tower.style.cssText =
    'position:absolute;left:' + originX + 'px;top:' + originY + 'px;width:' + towerW + 'px;height:' + towerH + 'px;' +
    'transform-origin:50% 100%;z-index:5;transition:transform 0.35s ease;';
  stage.appendChild(tower);

  const slots = [];
  for (let layer = 0; layer < layers; layer++) {
    const across = layer % 2 === 1;
    const jitter = across ? 4 : 0;
    for (let col = 0; col < 3; col++) {
      const el = makeBlock(bw, bh, layer * 3 + col, across);
      el.style.left = col * bw + jitter + 'px';
      el.style.top = (layers - 1 - layer) * (bh + 2) + 'px';
      el.style.zIndex = String(2 + layer * 3 + col);
      tower.appendChild(el);
      slots.push({ el: el, layer: layer, col: col, personI: null });
    }
  }

  const namedIdx = [];
  const used = new Set();
  order.forEach(function (_, personI) {
    let s = (personI * 5 + 4) % slots.length;
    while (used.has(s)) s = (s + 1) % slots.length;
    used.add(s);
    namedIdx.push(s);
  });
  if (namedIdx[targetIndex] < 3) {
    const swapWith = namedIdx.findIndex(function (s, i) {
      return i !== targetIndex && s >= 6;
    });
    if (swapWith >= 0) {
      const tmp = namedIdx[targetIndex];
      namedIdx[targetIndex] = namedIdx[swapWith];
      namedIdx[swapWith] = tmp;
    }
  }

  order.forEach(function (person, personI) {
    const slot = slots[namedIdx[personI]];
    const stamp = document.createElement('div');
    stamp.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;gap:4px;padding:0 5px;z-index:2;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.style.cssText =
      'width:' + Math.max(12, bh - 7) + 'px;height:' + Math.max(12, bh - 7) + 'px;border-radius:50%;' +
      'object-fit:cover;border:1px solid #1b110a;flex-shrink:0;background:#fbf4dd;';
    const nm = document.createElement('span');
    nm.textContent = String(person.name).slice(0, 8);
    nm.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:9px;color:#1b110a;' +
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,0.3);';
    stamp.appendChild(img);
    stamp.appendChild(nm);
    slot.el._face.appendChild(stamp);
    slot.personI = personI;
  });

  const stick = document.createElement('div');
  stick.style.cssText =
    'position:absolute;left:' + (stageW + 24) + 'px;top:200px;width:118px;height:11px;z-index:8;' +
    'background:linear-gradient(180deg,#d4b078,#6a4010);border:2px solid #1b110a;border-radius:4px;' +
    'box-shadow:2px 3px 0 rgba(0,0,0,0.45);transition:left 0.35s ease, top 0.35s ease;';
  stick.innerHTML =
    '<div style="position:absolute;left:-16px;top:-7px;width:20px;height:20px;border-radius:50%;' +
    'background:#e8bc78;border:2px solid #1b110a;"></div>';
  stage.appendChild(stick);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes jengaWobble {' +
    '  0%,100% { transform: rotate(0deg); }' +
    '  25% { transform: rotate(-2.8deg); }' +
    '  75% { transform: rotate(2.4deg); }' +
    '}' +
    '@keyframes jengaDust {' +
    '  0% { transform: translate(0,0) scale(1); opacity: 0.85; }' +
    '  100% { transform: translate(16px, 36px) scale(0.35); opacity: 0; }' +
    '}';
  document.head.appendChild(styleEl);

  document.body.appendChild(overlay);

  const pullOrder = order.map(function (_, i) { return i; }).filter(function (i) { return i !== targetIndex; });
  for (let i = pullOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pullOrder[i];
    pullOrder[i] = pullOrder[j];
    pullOrder[j] = tmp;
  }

  function dustAt(el) {
    const r = el.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    for (let k = 0; k < 5; k++) {
      const d = document.createElement('div');
      d.style.cssText =
        'position:absolute;width:5px;height:4px;background:#c48a3a;border:1px solid #1b110a;z-index:9;' +
        'left:' + (r.left - sr.left + 18 + k * 7) + 'px;top:' + (r.top - sr.top + 5) + 'px;' +
        'animation:jengaDust 0.55s ease-out forwards;';
      stage.appendChild(d);
      setTimeout(function () { d.remove(); }, 600);
    }
  }

  pullOrder.forEach(function (personI, nStep) {
    setTimeout(function () {
      const slot = slots[namedIdx[personI]];
      const dir = slot.col === 0 ? -1 : 1;
      const lean = (nStep + 1) * 1.2 * (nStep % 2 === 0 ? -1 : 1);
      const blockTop = originY + parseFloat(slot.el.style.top);
      stick.style.top = blockTop + 5 + 'px';
      stick.style.left = dir > 0
        ? originX + towerW - 18 + 'px'
        : originX - 108 + 'px';
      caption.textContent = 'Easing out ' + order[personI].name + '\u2026';
      tower.style.animation = 'none';
      void tower.offsetWidth;
      tower.style.animation = 'jengaWobble 0.45s ease-in-out';
      setTimeout(function () {
        dustAt(slot.el);
        slot.el.style.transform =
          'translateX(' + dir * 300 + 'px) translateY(' + (48 + nStep * 10) + 'px) rotate(' + dir * 24 + 'deg)';
        slot.el.style.opacity = '0.18';
        slot.el.style.filter = 'grayscale(1)';
        tower.style.transform = 'rotate(' + lean + 'deg)';
        caption.textContent = order[personI].name + ' \u2014 out';
      }, 280);
    }, nStep * PULL_MS);
  });

  const winAt = pullOrder.length * PULL_MS + 140;
  setTimeout(function () {
    stick.style.left = stageW + 24 + 'px';
    tower.style.animation = 'none';
    tower.style.transform = 'rotate(0deg)';
    const winSlot = slots[namedIdx[targetIndex]];
    winSlot.el.style.transform = 'scale(1.14) translateY(-5px)';
    winSlot.el.style.zIndex = '40';
    winSlot.el._face.style.boxShadow = '0 0 20px rgba(246,226,122,0.95), 2px 4px 0 rgba(0,0,0,0.35)';
    slots.forEach(function (s) {
      if (s.el !== winSlot.el && s.personI == null) {
        s.el.style.filter = 'brightness(0.82)';
      }
    });
    caption.textContent = winner.name + ' still standing';
  }, winAt);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, winAt + holdMs);
}
