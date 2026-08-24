import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'sumo';
export const label = 'Sumo';

const MAWASHI = ['#c83a1e', '#1b3a8a', '#1b110a', '#2c5d52', '#6b1a8a', '#b85a10'];
const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#d4a574'];

const RIKISHI_MOVE =
  'left 0.4s cubic-bezier(0.2,0.8,0.3,1.1), top 0.4s cubic-bezier(0.2,0.8,0.3,1.1),' +
  'transform 0.4s cubic-bezier(0.55,0.05,0.9,1.05), opacity 0.35s, filter 0.35s';

function makeRikishi(person, i) {
  const color = MAWASHI[i % MAWASHI.length];
  const skin = SKIN[i % SKIN.length];
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:88px;height:120px;z-index:6;' +
    'transition:' + RIKISHI_MOVE + ';' +
    'transform-origin:50% 90%;';

  const sprite = document.createElement('div');
  sprite.style.cssText = 'position:absolute;inset:0;transform-origin:50% 90%;';
  sprite.innerHTML =
    '<div style="position:absolute;left:22px;bottom:0;width:16px;height:22px;background:' + skin + ';' +
    'border:2px solid #1b110a;border-radius:4px;"></div>' +
    '<div style="position:absolute;right:22px;bottom:0;width:16px;height:22px;background:' + skin + ';' +
    'border:2px solid #1b110a;border-radius:4px;"></div>' +
    '<div style="position:absolute;left:10px;bottom:16px;width:68px;height:62px;' +
    'background:radial-gradient(circle at 35% 30%,' + skin + ',#a0673a 80%);' +
    'border:3px solid #1b110a;border-radius:50% 50% 42% 42%;"></div>' +
    '<div style="position:absolute;left:8px;bottom:28px;width:72px;height:22px;background:' + color + ';' +
    'border:3px solid #1b110a;border-radius:40%;box-shadow:inset 0 -4px 0 rgba(0,0,0,0.25);"></div>' +
    '<div style="position:absolute;left:6px;bottom:18px;width:18px;height:14px;background:' + color + ';' +
    'border:2px solid #1b110a;border-radius:6px;"></div>' +
    '<div style="position:absolute;right:6px;bottom:18px;width:18px;height:14px;background:' + color + ';' +
    'border:2px solid #1b110a;border-radius:6px;"></div>';

  const head = document.createElement('img');
  head.src = person.avatarUrl;
  head.style.cssText =
    'position:absolute;left:50%;top:4px;width:44px;height:44px;margin-left:-22px;' +
    'border-radius:50%;object-fit:cover;border:3px solid #1b110a;background:#fbf4dd;' +
    'box-shadow:0 3px 0 rgba(0,0,0,0.25);';
  sprite.appendChild(head);
  wrap.appendChild(sprite);
  wrap._sprite = sprite;

  const tag = document.createElement('div');
  tag.textContent = String(person.name).slice(0, 10);
  tag.style.cssText =
    'position:absolute;left:50%;bottom:-18px;transform:translateX(-50%);' +
    'font-family:"Rye","Times New Roman",serif;font-size:10px;color:#fbf4dd;' +
    'text-shadow:0 1px 2px #000;white-space:nowrap;';
  wrap.appendChild(tag);
  return wrap;
}

function faceOnLeft(el, onLeft) {
  el._sprite.style.transform = onLeft ? 'none' : 'scaleX(-1)';
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

/** Pair remaining rikishi until one is left. The named winner never loses a bout;
 *  which side stays is random, and non-final bouts can be between two non-winners. */
function planBouts(count, targetIndex) {
  const remaining = [];
  for (let i = 0; i < count; i++) remaining.push(i);
  const bouts = [];
  while (remaining.length > 1) {
    shuffleInPlace(remaining);
    const a = remaining[0];
    const b = remaining[1];
    let win;
    if (a === targetIndex) win = a;
    else if (b === targetIndex) win = b;
    else win = Math.random() < 0.5 ? a : b;
    const lose = win === a ? b : a;
    bouts.push({ win: win, lose: lose, winOnLeft: Math.random() < 0.5 });
    remaining.splice(remaining.indexOf(lose), 1);
  }
  return bouts;
}

/** Bouts on the dohyo. Either side can be thrown; last one standing is the pick. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const BOUT_MS = 950;
  const holdMs = 850;

  const headline = document.createElement('div');
  headline.textContent = 'Sumo';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:26px;letter-spacing:5px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 640;
  const stageH = 420;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#1e140c 0%,#3a2414 40%,#2a1810 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Hakkiyoi!';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:12px;text-align:center;z-index:10;' +
    'font-family:"Rye","Times New Roman",serif;font-size:16px;letter-spacing:2px;color:#f6e27a;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  [['#c83a1e', 'left:18px'], ['#d99a2b', 'right:18px']].forEach(function (pair) {
    const lan = document.createElement('div');
    lan.style.cssText =
      'position:absolute;top:44px;' + pair[1] + ';width:36px;height:48px;background:' + pair[0] + ';' +
      'border:3px solid #1b110a;border-radius:8px;box-shadow:0 0 18px ' + pair[0] + ';';
    lan.innerHTML =
      '<div style="position:absolute;left:50%;top:-10px;width:8px;height:12px;margin-left:-4px;background:#1b110a;"></div>';
    stage.appendChild(lan);
  });

  const dais = document.createElement('div');
  dais.style.cssText =
    'position:absolute;left:70px;top:118px;width:500px;height:250px;' +
    'background:linear-gradient(180deg,#c4a056,#8a6230 70%,#5a3a18);' +
    'border:4px solid #1b110a;border-radius:8px;' +
    'box-shadow:0 16px 0 #3a2410, 0 22px 28px rgba(0,0,0,0.5);';
  stage.appendChild(dais);

  const ringR = 108;
  const dohyo = document.createElement('div');
  dohyo.style.cssText =
    'position:absolute;left:142px;top:18px;width:' + ringR * 2 + 'px;height:' + ringR * 2 + 'px;border-radius:50%;' +
    'background:radial-gradient(circle at 42% 32%,#f3dd9a,#d4b06a 52%,#a07838);' +
    'box-shadow:inset 0 0 0 7px #fbf4dd, inset 0 0 0 14px #1b110a, 0 8px 16px rgba(0,0,0,0.25);';
  dais.appendChild(dohyo);

  const mark = document.createElement('div');
  mark.style.cssText =
    'position:absolute;left:50%;top:50%;width:36px;height:36px;margin:-18px 0 0 -18px;border-radius:50%;' +
    'border:3px solid rgba(27,17,10,0.45);';
  dohyo.appendChild(mark);

  ['#c83a1e', '#1b3a8a', '#fbf4dd', '#1b110a'].forEach(function (c, i) {
    const ang = (Math.PI / 2) * i - Math.PI / 2;
    const t = document.createElement('div');
    t.style.cssText =
      'position:absolute;left:' + (ringR + Math.cos(ang) * (ringR - 8) - 7) + 'px;' +
      'top:' + (ringR + Math.sin(ang) * (ringR - 8) - 7) + 'px;' +
      'width:14px;height:14px;background:' + c + ';border:2px solid #1b110a;transform:rotate(45deg);';
    dohyo.appendChild(t);
  });

  const gyoji = document.createElement('div');
  gyoji.style.cssText =
    'position:absolute;left:298px;top:86px;width:44px;height:70px;z-index:7;transform-origin:50% 100%;';
  gyoji.innerHTML =
    '<div style="position:absolute;left:8px;bottom:0;width:28px;height:40px;background:#1b110a;' +
    'border:2px solid #d99a2b;border-radius:6px 6px 2px 2px;"></div>' +
    '<div style="position:absolute;left:50%;top:0;width:22px;height:22px;margin-left:-11px;border-radius:50%;' +
    'background:#f1c27d;border:2px solid #1b110a;"></div>' +
    '<div style="position:absolute;right:-10px;top:18px;width:28px;height:8px;background:#d99a2b;' +
    'border:2px solid #1b110a;border-radius:2px;transform:rotate(-25deg);"></div>';
  stage.appendChild(gyoji);

  const restLeft = 168;
  const restRight = 384;
  const clashLeft = 236;
  const clashRight = 316;
  const enterLeft = -100;
  const enterRight = 640;
  const throwLeftX = -90;
  const throwRightX = 610;
  const ringTop = 188;

  const dust = document.createElement('div');
  dust.style.cssText =
    'position:absolute;left:50%;top:250px;width:140px;height:48px;margin-left:-70px;z-index:8;opacity:0;' +
    'background:radial-gradient(ellipse, rgba(243,221,154,0.95), transparent 70%);pointer-events:none;';
  stage.appendChild(dust);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes sumoStomp { 0%,100% { transform: translateY(0); } 40% { transform: translateY(-12px); } 70% { transform: translateY(4px); } }' +
    '@keyframes sumoGyoji { 0%,100% { transform: rotate(0deg); } 40% { transform: rotate(-14deg); } 70% { transform: rotate(12deg); } }' +
    '@keyframes sumoDust { 0% { opacity: 0; transform: scale(0.4); } 35% { opacity: 1; transform: scale(1.25); } 100% { opacity: 0; transform: scale(1.9); } }' +
    '@keyframes sumoShake { 0%,100% { transform: translateX(0); } 30% { transform: translateX(-5px); } 70% { transform: translateX(5px); } }';
  document.head.appendChild(styleEl);

  document.body.appendChild(overlay);

  const bouts = planBouts(order.length, targetIndex);
  let live = [];
  let champEl = null;

  function clearLive() {
    live.forEach(function (el) { el.remove(); });
    live = [];
  }

  function spawn(idx, onLeft, enterX) {
    const el = makeRikishi(order[idx], idx);
    el.style.left = enterX + 'px';
    el.style.top = ringTop + 'px';
    faceOnLeft(el, onLeft);
    stage.appendChild(el);
    live.push(el);
    return el;
  }

  bouts.forEach(function (bout, n) {
    setTimeout(function () {
      clearLive();
      const winOnLeft = bout.winOnLeft;
      const leftIdx = winOnLeft ? bout.win : bout.lose;
      const rightIdx = winOnLeft ? bout.lose : bout.win;
      const winEl = spawn(bout.win, winOnLeft, winOnLeft ? enterLeft : enterRight);
      const loseEl = spawn(bout.lose, !winOnLeft, winOnLeft ? enterRight : enterLeft);
      champEl = winEl;

      caption.textContent = order[leftIdx].name + '  vs  ' + order[rightIdx].name;
      gyoji.style.animation = 'none';
      void gyoji.offsetWidth;
      gyoji.style.animation = 'sumoGyoji 0.45s ease-in-out';

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          winEl.style.left = (winOnLeft ? restLeft : restRight) + 'px';
          loseEl.style.left = (winOnLeft ? restRight : restLeft) + 'px';
        });
      });

      setTimeout(function () {
        winEl.style.left = (winOnLeft ? clashLeft : clashRight) + 'px';
        loseEl.style.left = (winOnLeft ? clashRight : clashLeft) + 'px';
        dais.style.animation = 'none';
        void dais.offsetWidth;
        dais.style.animation = 'sumoShake 0.28s ease-in-out';
        dust.style.animation = 'none';
        void dust.offsetWidth;
        dust.style.animation = 'sumoDust 0.45s ease-out';
      }, 340);

      setTimeout(function () {
        loseEl.style.left = (winOnLeft ? throwRightX : throwLeftX) + 'px';
        loseEl.style.top = '36px';
        loseEl.style.transform = 'rotate(' + (winOnLeft ? -62 : 62) + 'deg)';
        loseEl.style.filter = 'grayscale(1)';
        loseEl.style.opacity = '0.2';
        winEl.style.left = (winOnLeft ? restLeft : restRight) + 'px';
        winEl.style.animation = 'none';
        void winEl.offsetWidth;
        winEl.style.animation = 'sumoStomp 0.4s ease';
        caption.textContent = order[bout.lose].name + ' \u2014 out!';
      }, 580);
    }, n * BOUT_MS);
  });

  const winAt = Math.max(bouts.length, 1) * BOUT_MS;
  setTimeout(function () {
    if (champEl) {
      champEl.style.left = '276px';
      champEl.style.top = '176px';
      champEl.style.transform = 'scale(1.28)';
      champEl.style.filter = 'drop-shadow(0 0 16px rgba(217,154,43,0.95))';
    }
    caption.textContent = winner.name + '  \u2014  YOSHI!';
    gyoji.style.animation = 'sumoGyoji 0.5s ease-in-out 2';
  }, winAt);

  setTimeout(function () {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, winAt + holdMs);
}
