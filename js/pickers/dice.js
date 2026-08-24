import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'dice';
export const label = 'Dice';

const SIZE = 168;
const HALF = SIZE / 2;

const FACE_XF = [
  `translateZ(${HALF}px)`,
  `rotateY(180deg) translateZ(${HALF}px)`,
  `rotateY(90deg) translateZ(${HALF}px)`,
  `rotateY(-90deg) translateZ(${HALF}px)`,
  `rotateX(90deg) translateZ(${HALF}px)`,
  `rotateX(-90deg) translateZ(${HALF}px)`,
];

const FACE_LIGHT = [
  'linear-gradient(145deg,#fffaf0 0%,#f3e4c4 55%,#e2c894 100%)',
  'linear-gradient(145deg,#d8c49a 0%,#c4ad7e 100%)',
  'linear-gradient(145deg,#efe0bc 0%,#d4b87e 100%)',
  'linear-gradient(145deg,#fff6e4 0%,#ead5a8 100%)',
  'linear-gradient(180deg,#fffdf6 0%,#f0e0b8 100%)',
  'linear-gradient(180deg,#c9b17a 0%,#a88c52 100%)',
];

const PIPS = [
  [[50, 50]],
  [[24, 24], [76, 76]],
  [[24, 24], [50, 50], [76, 76]],
  [[24, 24], [76, 24], [24, 76], [76, 76]],
  [[24, 24], [76, 24], [50, 50], [24, 76], [76, 76]],
  [[24, 24], [76, 24], [24, 50], [76, 50], [24, 76], [76, 76]],
];

function pipEl(x, y) {
  const d = document.createElement('div');
  d.style.cssText =
    'position:absolute;left:' + x + '%;top:' + y + '%;width:18px;height:18px;' +
    'margin:-9px 0 0 -9px;border-radius:50%;background:#1b110a;' +
    'box-shadow:inset 0 2px 2px rgba(255,255,255,0.18), 0 1px 0 rgba(255,255,255,0.35);';
  return d;
}

function makeFace(person, i) {
  const face = document.createElement('div');
  face.style.cssText =
    'position:absolute;inset:0;transform:' + FACE_XF[i] + ';' +
    'background:' + FACE_LIGHT[i] + ';border:3px solid #1b110a;border-radius:18px;' +
    'box-shadow:inset 5px 5px 14px rgba(255,255,255,0.55), inset -8px -10px 18px rgba(80,50,10,0.22);' +
    'backface-visibility:hidden;overflow:hidden;';

  PIPS[i].forEach(([x, y]) => {
    if (x === 50 && y === 50) return;
    face.appendChild(pipEl(x, y));
  });

  const stamp = document.createElement('div');
  stamp.style.cssText =
    'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);' +
    'display:flex;flex-direction:column;align-items:center;gap:6px;';

  const img = document.createElement('img');
  img.src = person.avatarUrl;
  img.alt = '';
  img.style.cssText =
    'width:72px;height:72px;border-radius:50%;object-fit:cover;' +
    'border:3px solid #1b110a;box-shadow:0 3px 0 #1b110a, inset 0 0 0 2px #fbf4dd;background:#fbf4dd;';
  stamp.appendChild(img);

  const name = document.createElement('span');
  name.textContent = String(person.name).split(' ')[0].slice(0, 10);
  name.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:11px;letter-spacing:0.5px;' +
    'color:#1b110a;text-transform:uppercase;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  stamp.appendChild(name);
  face.appendChild(stamp);
  return face;
}

/** Casino die on felt: a cup rattles, the cube tumbles out, winner lands on the front face. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const totalMs = CONFIG.spinDuration;
  const rattleMs = Math.max(420, Math.round(totalMs * 0.22));
  const tumbleMs = Math.max(900, totalMs - rattleMs - 420);
  const holdMs = Math.max(380, totalMs - rattleMs - tumbleMs);

  const css = document.createElement('style');
  css.textContent =
    '@keyframes standupDiceCupRattle{' +
      '0%,100%{transform:rotate(-4deg)}' +
      '25%{transform:rotate(10deg) translateY(-4px)}' +
      '50%{transform:rotate(-12deg)}' +
      '75%{transform:rotate(7deg) translateY(-2px)}' +
    '}' +
    '@keyframes standupDiceCupDump{' +
      '0%{transform:rotate(-4deg)}' +
      '100%{transform:rotate(-48deg) translate(8px,-6px)}' +
    '}';
  overlay.appendChild(css);

  const headline = document.createElement('div');
  headline.textContent = 'Dice';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:26px;letter-spacing:6px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stageW = 560;
  const stageH = 380;
  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
    'background:radial-gradient(ellipse at 50% 40%,#2f7a4a 0%,#165832 48%,#0c2e1c 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const felt = document.createElement('div');
  felt.style.cssText =
    'position:absolute;inset:10px;border:2px solid rgba(251,244,221,0.18);border-radius:6px;' +
    'background:repeating-linear-gradient(90deg,transparent 0 11px,rgba(0,0,0,0.05) 11px 12px),' +
    'repeating-linear-gradient(0deg,transparent 0 11px,rgba(255,255,255,0.04) 11px 12px);' +
    'pointer-events:none;';
  stage.appendChild(felt);

  const caption = document.createElement('div');
  caption.textContent = 'Shake the cup\u2026';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:16px;text-align:center;z-index:6;' +
    'font-family:"Rye","Times New Roman",serif;font-size:15px;letter-spacing:1px;color:#fbf4dd;' +
    'text-shadow:0 2px 0 #1b110a;';
  stage.appendChild(caption);

  const cup = document.createElement('div');
  cup.style.cssText =
    'position:absolute;left:36px;bottom:78px;width:92px;height:118px;z-index:4;' +
    'transform-origin:50% 92%;transform:rotate(-4deg);';
  cup.innerHTML =
    '<div style="position:absolute;inset:0;background:linear-gradient(180deg,#8a4a22 0%,#5a2a12 55%,#3a180a 100%);' +
    'border:3px solid #1b110a;border-radius:14px 14px 42px 42px;box-shadow:6px 10px 0 rgba(0,0,0,0.35);overflow:hidden;">' +
    '<div style="position:absolute;left:10px;right:10px;top:8px;height:18px;border-radius:8px;' +
    'background:linear-gradient(180deg,#c47a40,#6a3414);border:2px solid #1b110a;"></div>' +
    '<div style="position:absolute;left:14px;right:14px;top:34px;bottom:16px;border-radius:0 0 28px 28px;' +
    'background:radial-gradient(ellipse at 50% 0%,#2a1408 0%,#1b110a 80%);opacity:0.85;"></div></div>';
  stage.appendChild(cup);

  const scene = document.createElement('div');
  scene.style.cssText =
    'position:absolute;left:0;top:0;width:100%;height:100%;' +
    'perspective:900px;transform-style:preserve-3d;pointer-events:none;';
  stage.appendChild(scene);

  const rig = document.createElement('div');
  rig.style.cssText =
    'position:absolute;left:50%;top:54%;width:' + SIZE + 'px;height:' + SIZE + 'px;' +
    'margin-left:' + -HALF + 'px;margin-top:' + -HALF + 'px;' +
    'transform-style:preserve-3d;transform:translate(-168px, 28px) scale(0.42);';
  scene.appendChild(rig);

  const shadow = document.createElement('div');
  shadow.style.cssText =
    'position:absolute;left:50%;bottom:42px;width:150px;height:28px;margin-left:-75px;' +
    'background:radial-gradient(ellipse,rgba(0,0,0,0.55),transparent 70%);' +
    'filter:blur(4px);transform:translate(-168px,0) scale(0.45);opacity:0.35;';
  stage.appendChild(shadow);

  const cube = document.createElement('div');
  cube.style.cssText =
    'position:absolute;inset:0;transform-style:preserve-3d;' +
    'transform:rotateX(-50deg) rotateY(40deg) rotateZ(18deg);';
  rig.appendChild(cube);

  for (let i = 0; i < 6; i++) {
    cube.appendChild(makeFace(order[(targetIndex + i) % order.length], i));
  }

  document.body.appendChild(overlay);

  const xSpins = 5 + Math.floor(Math.random() * 3);
  const ySpins = 6 + Math.floor(Math.random() * 3);
  const zSpins = 2 + Math.floor(Math.random() * 2);
  const land = 'rotateX(' + xSpins * 360 + 'deg) rotateY(' + ySpins * 360 + 'deg) rotateZ(' + zSpins * 360 + 'deg)';

  cup.style.animation = 'standupDiceCupRattle 0.16s linear infinite';

  setTimeout(() => {
    cup.style.animation = 'standupDiceCupDump 280ms cubic-bezier(0.2,0.8,0.2,1) forwards';
    caption.textContent = 'Roll \u2019em';
    rig.animate(
      [
        { transform: 'translate(-168px, 28px) scale(0.42)', easing: 'ease-out' },
        { transform: 'translate(36px, -88px) scale(1.06)', offset: 0.28 },
        { transform: 'translate(-18px, 22px) scale(0.96)', offset: 0.52 },
        { transform: 'translate(12px, -28px) scale(1.03)', offset: 0.72 },
        { transform: 'translate(0, 0) scale(1)' },
      ],
      { duration: tumbleMs, easing: 'cubic-bezier(0.18, 0.7, 0.22, 1)', fill: 'forwards' }
    );
    shadow.animate(
      [
        { transform: 'translate(-168px,0) scale(0.45)', opacity: 0.3 },
        { transform: 'translate(36px,0) scale(0.7)', opacity: 0.18, offset: 0.28 },
        { transform: 'translate(-18px,0) scale(1.05)', opacity: 0.5, offset: 0.52 },
        { transform: 'translate(12px,0) scale(0.85)', opacity: 0.28, offset: 0.72 },
        { transform: 'translate(0,0) scale(1)', opacity: 0.55 },
      ],
      { duration: tumbleMs, easing: 'cubic-bezier(0.18, 0.7, 0.22, 1)', fill: 'forwards' }
    );
    cube.animate(
      [
        { transform: 'rotateX(-50deg) rotateY(40deg) rotateZ(18deg)' },
        { transform: land },
      ],
      { duration: tumbleMs, easing: 'cubic-bezier(0.12, 0.62, 0.18, 1.02)', fill: 'forwards' }
    );
  }, rattleMs);

  setTimeout(() => {
    caption.textContent = String(winner.name).split(' ')[0];
    cube.animate(
      [
        { transform: land },
        { transform: land + ' scale(1.06)' },
        { transform: land },
      ],
      { duration: 420, easing: 'ease-out', fill: 'forwards' }
    );
  }, rattleMs + tumbleMs);

  setTimeout(() => {
    overlay.remove();
    revealWinner(order, targetIndex);
  }, rattleMs + tumbleMs + holdMs);
}
