import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'jenga';
export const label = 'Jenga';

/** Named blocks stacked in a tower. Loser blocks get pulled; the winner stays. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const PULL_MS = 700;
  const holdMs = 650;

  const headline = document.createElement('div');
  headline.textContent = 'Jenga';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:4px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 360;
  const blockH = 28;
  const blockW = 220;
  const n = order.length;
  const stageH = Math.max(320, n * (blockH + 4) + 80);
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#2a1a10,#120c08);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.7);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Don\'t let it fall';
  caption.style.cssText =
    'position:absolute;left:12px;right:12px;top:10px;text-align:center;z-index:8;' +
    'font-family:"Fraunces",Georgia,serif;font-size:13px;font-style:italic;color:#fbf4dd;';
  stage.appendChild(caption);

  const tower = document.createElement('div');
  tower.style.cssText =
    'position:absolute;left:50%;bottom:18px;width:' + blockW + 'px;margin-left:-' + blockW / 2 + 'px;' +
    'display:flex;flex-direction:column-reverse;gap:3px;transform-origin:50% 100%;' +
    'transition:transform 0.25s ease;';
  stage.appendChild(tower);

  const palette = ['#e8c97a', '#d4a24a', '#c48a3a', '#f1d48a', '#b87a28'];
  const blocks = order.map(function (person, i) {
    const row = document.createElement('div');
    const offset = (i % 2 === 0 ? -8 : 8);
    row.style.cssText =
      'height:' + blockH + 'px;margin-left:' + offset + 'px;width:' + (blockW - 16) + 'px;' +
      'background:linear-gradient(180deg,' + palette[i % palette.length] + ',#8a5a18);' +
      'border:2px solid #1b110a;border-radius:3px;display:flex;align-items:center;gap:8px;padding:0 8px;' +
      'transition:transform 0.55s cubic-bezier(0.55,0.05,0.8,1.05), opacity 0.4s, filter 0.4s, margin 0.4s;';
    const img = document.createElement('img');
    img.src = person.avatarUrl;
    img.style.cssText = 'width:20px;height:20px;border-radius:50%;object-fit:cover;border:1px solid #1b110a;';
    const nm = document.createElement('span');
    nm.textContent = person.name;
    nm.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#1b110a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    row.appendChild(img);
    row.appendChild(nm);
    tower.appendChild(row);
    return row;
  });

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes jengaWobble { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(-2.2deg); } 70% { transform: rotate(2.2deg); } }';
  document.head.appendChild(styleEl);

  document.body.appendChild(overlay);

  const pull = order.map(function (_, i) { return i; }).filter(function (i) { return i !== targetIndex; });
  for (let i = pull.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pull[i];
    pull[i] = pull[j];
    pull[j] = tmp;
  }

  pull.forEach(function (idx, nStep) {
    setTimeout(function () {
      tower.style.animation = 'none';
      void tower.offsetWidth;
      tower.style.animation = 'jengaWobble 0.4s ease-in-out';
      const dir = nStep % 2 === 0 ? 1 : -1;
      blocks[idx].style.transform = 'translateX(' + dir * 260 + 'px) rotate(' + dir * 18 + 'deg)';
      blocks[idx].style.opacity = '0.25';
      blocks[idx].style.filter = 'grayscale(1)';
      caption.textContent = order[idx].name + ' pulled';
    }, nStep * PULL_MS);
  });

  const winAt = pull.length * PULL_MS;
  setTimeout(function () {
    tower.style.animation = 'none';
    tower.style.transform = 'rotate(0deg)';
    blocks[targetIndex].style.transform = 'scale(1.08)';
    blocks[targetIndex].style.boxShadow = '0 0 16px rgba(255,232,150,0.9)';
    caption.textContent = winner.name + ' still standing';
  }, winAt);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, winAt + holdMs);
}
