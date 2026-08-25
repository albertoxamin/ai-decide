import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'domino';
export const label = 'Domino chain';

function uid() {
  return 'dom_' + Math.random().toString(36).slice(2, 9);
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function pipsEl(count) {
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:relative;width:36px;height:36px;flex-shrink:0;';
  const spots = {
    1: [[50, 50]],
    2: [[22, 22], [78, 78]],
    3: [[22, 22], [50, 50], [78, 78]],
    4: [[22, 22], [78, 22], [22, 78], [78, 78]],
    5: [[22, 22], [78, 22], [50, 50], [22, 78], [78, 78]],
    6: [[22, 22], [78, 22], [22, 50], [78, 50], [22, 78], [78, 78]],
  };
  (spots[count] || spots[1]).forEach(([x, y]) => {
    const d = document.createElement('div');
    d.style.cssText =
      'position:absolute;left:' + x + '%;top:' + y + '%;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;' +
      'border-radius:50%;background:#1b110a;';
    wrap.appendChild(d);
  });
  return wrap;
}

/** Ivory tiles on felt: the chain topples until one bone stays standing. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #143018 0%, #060a06 72%)';
  const ns = uid();

  const headline = document.createElement('div');
  headline.textContent = 'Domino Chain';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const layout = shuffle(order.map((_, i) => i));
  let winnerVisualIdx = layout.indexOf(targetIndex);
  if (winnerVisualIdx === 0 && layout.length > 1) {
    const swapWith = 1 + Math.floor(Math.random() * (layout.length - 1));
    const tmp = layout[0];
    layout[0] = layout[swapWith];
    layout[swapWith] = tmp;
    winnerVisualIdx = layout.indexOf(targetIndex);
  }

  const n = layout.length;
  const tileW = n > 10 ? 48 : 58;
  const tileH = n > 10 ? 108 : 128;
  const gap = 8;
  const stageW = Math.max(520, Math.min(740, n * (tileW + gap) + 56));
  const stageH = 300;

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 50% 40%,#2c5d52 0%,#143028 70%,#0c1814 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Tip the first bone';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:12px;text-align:center;z-index:4;' +
    'font-family:"Rye","Times New Roman",serif;font-size:14px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  const rail = document.createElement('div');
  rail.style.cssText =
    'position:absolute;left:18px;right:18px;bottom:28px;height:10px;z-index:1;' +
    'background:#3a2410;border:2px solid #1b110a;border-radius:4px;';
  stage.appendChild(rail);

  const row = document.createElement('div');
  row.style.cssText =
    'position:absolute;left:24px;right:24px;bottom:36px;z-index:2;display:flex;' +
    'justify-content:center;align-items:flex-end;gap:' + gap + 'px;perspective:600px;';
  stage.appendChild(row);

  const dominos = [];
  layout.forEach((orderIdx, visualIdx) => {
    const person = order[orderIdx];
    const pipCount = (visualIdx % 6) + 1;
    const dom = document.createElement('div');
    dom.style.cssText =
      'width:' + tileW + 'px;height:' + tileH + 'px;flex-shrink:0;' +
      'background:linear-gradient(180deg,#fffaf0 0%,#e8dcc0 100%);' +
      'border:3px solid #1b110a;border-radius:6px;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:space-between;' +
      'padding:8px 4px;box-shadow:4px 4px 0 #1b110a;' +
      'transform-origin:bottom right;' +
      'transition:transform 0.3s cubic-bezier(0.5,0.1,0.7,1), box-shadow 0.3s, filter 0.3s;';

    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.alt = '';
    img.style.cssText =
      'width:' + Math.min(36, tileW - 14) + 'px;height:' + Math.min(36, tileW - 14) + 'px;' +
      'border-radius:50%;object-fit:cover;border:2px solid #1b110a;';

    const divider = document.createElement('div');
    divider.style.cssText = 'width:70%;height:2px;background:#1b110a;opacity:0.7;';

    const name = document.createElement('span');
    name.textContent = person.name.split(' ')[0].slice(0, 8);
    name.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:8px;color:#1b110a;letter-spacing:0.2px;';

    dom.appendChild(img);
    dom.appendChild(name);
    dom.appendChild(divider);
    dom.appendChild(pipsEl(pipCount));
    row.appendChild(dom);
    dominos.push(dom);
  });

  document.body.appendChild(overlay);

  const fallable = Math.max(1, winnerVisualIdx);
  const stepMs = Math.min(160, (CONFIG.spinDuration - 900) / fallable);
  for (let i = 0; i < winnerVisualIdx; i++) {
    setTimeout(() => {
      dominos[i].style.transform = 'rotate(92deg)';
      dominos[i].style.filter = 'brightness(0.7)';
      caption.textContent = 'Clack';
    }, 280 + i * stepMs);
  }

  setTimeout(() => {
    const w = dominos[winnerVisualIdx];
    w.style.boxShadow = '0 0 0 3px #f6e27a, 6px 6px 0 #1b110a, 0 0 22px rgba(246,226,122,0.7)';
    w.style.transform = 'translateY(-12px)';
    caption.textContent = 'Still standing';
  }, 380 + winnerVisualIdx * stepMs);

  setTimeout(() => {
    overlay.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 120);
}
