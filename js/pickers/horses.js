import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'horses';
export const label = 'Horse race';

function uid() {
  return 'hrs_' + Math.random().toString(36).slice(2, 9);
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

const SILKS = ['#c83a1e', '#2c5d52', '#d99a2b', '#1b110a', '#007aff', '#e81dbb', '#0cc846', '#5856d6'];

function makeHorse(person, color, ns) {
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;left:10px;top:6px;height:44px;width:92px;z-index:3;' +
    'animation:' + ns + '_gallop 0.22s ease-in-out infinite;';

  const body = document.createElement('div');
  body.style.cssText = 'width:86px;height:48px;flex-shrink:0;filter:drop-shadow(0 2px 0 #1b110a);';
  body.innerHTML =
    '<svg viewBox="0 0 86 48" width="86" height="48" aria-hidden="true">' +
      '<g fill="' + color + '" stroke="#1b110a" stroke-width="2.1" stroke-linejoin="round">' +
        '<path d="M12 24 C6 22 4 30 10 32 C8 38 8 42 12 44 H16 C15 36 16 32 18 30 H24"/>' +
        '<rect x="16" y="18" width="36" height="14" rx="7"/>' +
        '<path d="M48 20 L56 14 L60 16 L54 24 Z"/>' +
        '<ellipse cx="64" cy="14" rx="7" ry="5"/>' +
        '<rect x="22" y="30" width="5" height="12" rx="2"/>' +
        '<rect x="30" y="30" width="5" height="12" rx="2"/>' +
        '<rect x="40" y="30" width="5" height="12" rx="2"/>' +
        '<rect x="48" y="30" width="5" height="12" rx="2"/>' +
      '</g>' +
      '<circle cx="66" cy="13" r="1.3" fill="#1b110a"/>' +
      '<rect x="30" y="14" width="16" height="11" rx="2" fill="#fbf4dd" stroke="#1b110a" stroke-width="1.6"/>' +
    '</svg>';

  const helmet = document.createElement('img');
  helmet.src = person.avatarUrl;
  helmet.alt = '';
  helmet.style.cssText =
    'position:absolute;left:32px;top:6px;width:16px;height:16px;border-radius:50%;' +
    'object-fit:cover;border:2px solid #1b110a;background:#fbf4dd;z-index:2;';

  const nameTag = document.createElement('span');
  nameTag.textContent = person.name.split(' ')[0].slice(0, 10);
  nameTag.style.cssText =
    'position:absolute;left:4px;top:-16px;font-family:"Rye","Times New Roman",serif;font-size:10px;color:#1b110a;' +
    'background:#fbf4dd;border:2px solid #1b110a;padding:1px 6px;border-radius:2px;' +
    'box-shadow:2px 2px 0 #1b110a;white-space:nowrap;z-index:4;';

  wrap.appendChild(body);
  wrap.appendChild(helmet);
  wrap.appendChild(nameTag);
  return wrap;
}

/** Dirt oval in miniature: silks gallop; only the pick breaks the wire. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = 'radial-gradient(ellipse at center, #1a2810 0%, #060806 72%)';
  const ns = uid();

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + ns + '_gallop {' +
      '0%,100% { transform: translateY(0) }' +
      '50% { transform: translateY(-5px) }' +
    '}';
  document.head.appendChild(styleEl);

  const headline = document.createElement('div');
  headline.textContent = 'Horse Race';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
    'color:#f6e27a;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const trackW = 640;
  const laneH = 52;
  const trackPadTop = 44;
  const totalH = Math.max(220, order.length * laneH + trackPadTop + 18);
  const finishX = trackW - 56;

  const track = document.createElement('div');
  track.style.cssText =
    'position:relative;width:' + trackW + 'px;height:' + totalH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#87a8c8 0%,#c8dcec ' + (trackPadTop / totalH) * 100 + '%,' +
    '#c4a06a ' + (trackPadTop / totalH) * 100 + '%,#8a6230 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(track);

  const rail = document.createElement('div');
  rail.style.cssText =
    'position:absolute;left:0;right:0;top:' + (trackPadTop - 6) + 'px;height:6px;z-index:2;' +
    'background:repeating-linear-gradient(90deg,#fbf4dd 0 18px,#1b110a 18px 22px);';
  track.appendChild(rail);

  const finishLine = document.createElement('div');
  finishLine.style.cssText =
    'position:absolute;left:' + finishX + 'px;top:' + (trackPadTop - 8) + 'px;bottom:0;width:12px;z-index:2;' +
    'background:repeating-linear-gradient(180deg,#fbf4dd 0 10px,#1b110a 10px 20px);' +
    'border-left:2px solid #1b110a;border-right:2px solid #1b110a;';
  track.appendChild(finishLine);

  const post = document.createElement('div');
  post.style.cssText =
    'position:absolute;left:' + (finishX + 2) + 'px;top:6px;z-index:4;' +
    'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#1b110a;' +
    'background:#f6e27a;border:2px solid #1b110a;padding:2px 6px;box-shadow:2px 2px 0 #1b110a;';
  post.textContent = 'FINISH';
  track.appendChild(post);

  const laneLayout = shuffle(order.map((_, i) => i));
  const horses = [];
  laneLayout.forEach((orderIdx, laneIdx) => {
    const person = order[orderIdx];
    const lane = document.createElement('div');
    lane.style.cssText =
      'position:absolute;left:0;right:0;top:' + (trackPadTop + laneIdx * laneH) + 'px;height:' + laneH + 'px;' +
      'background:' + (laneIdx % 2 ? 'rgba(90,50,16,0.18)' : 'transparent') + ';' +
      'border-bottom:1px dashed rgba(27,17,10,0.35);';

    const easeY = 0.3 + Math.random() * 0.5;
    const horse = makeHorse(person, SILKS[orderIdx % SILKS.length], ns);
    horse.style.transition = 'left ' + (CONFIG.spinDuration - 100) + 'ms cubic-bezier(0.3, ' + easeY.toFixed(2) + ', 0.7, 1)';
    lane.appendChild(horse);
    track.appendChild(lane);
    horses.push({ horse: horse, isWinner: orderIdx === targetIndex });
  });

  document.body.appendChild(overlay);

  setTimeout(() => {
    horses.forEach(({ horse, isWinner }) => {
        const finalX = isWinner ? finishX - 82 : finishX - 170 - Math.random() * 70;
      horse.style.left = finalX + 'px';
    });
  }, 50);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, CONFIG.spinDuration + 140);
}
