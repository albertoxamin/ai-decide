import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'minecraft';
export const label = 'Minecraft dig';

/** Broken in order. The person is standing under the last one. */
const SHAFT = [
  { id: 'grass', label: 'Grass Block', chip: '#67a33a' },
  { id: 'dirt', label: 'Dirt', chip: '#8b5a2b' },
  { id: 'stone', label: 'Stone', chip: '#8d8d8d' },
];

export function mineSequence() {
  return SHAFT.map((block) => block.id);
}

if (mineSequence().join(',') !== 'grass,dirt,stone') {
  throw new Error('person is found after grass, dirt, and stone');
}

const S = 40;
const COLS = 11;
const ROWS = 7;
const PATH_Z = 3;
const START_X = 1;
const DIG_X = 6;
const SHIRTS = ['#c83a1e', '#2c5d52', '#d99a2b', '#3d4c9e', '#6b2fbb', '#e67e22'];

const STEVE_FACE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" shape-rendering="crispEdges">' +
      '<rect width="8" height="8" fill="#c6a27a"/>' +
      '<rect width="8" height="3" fill="#3b2414"/>' +
      '<rect x="1" y="3" width="2" height="2" fill="#fff"/>' +
      '<rect x="5" y="3" width="2" height="2" fill="#fff"/>' +
      '<rect x="1" y="4" width="1" height="1" fill="#2c1b4a"/>' +
      '<rect x="5" y="4" width="1" height="1" fill="#2c1b4a"/>' +
      '<rect x="3" y="5" width="2" height="1" fill="#a67b5b"/>' +
      '<rect x="2" y="6" width="4" height="1" fill="#8d3a3a"/>' +
      '</svg>'
  );

function avatarPaint(url) {
  return 'url("' + url + '") center/cover no-repeat';
}

/** 16×16 pixel block textures. Drawn here so the page stays one file. */
let TEX = null;

function noise(seed) {
  return function (x, y) {
    let n = Math.imul(x + seed, 374761393) ^ Math.imul(y + seed * 17, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  };
}

function fillNoise(ctx, seed, colors) {
  const h = noise(seed);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      ctx.fillStyle = colors[Math.floor(h(x, y) * colors.length)];
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function canvasTex(draw) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  draw(c.getContext('2d'));
  return 'url("' + c.toDataURL() + '") 0 0 / 100% 100% no-repeat';
}

function textures() {
  if (TEX) return TEX;
  const dirt = ['#866043', '#79553a', '#916846', '#6b4b32', '#9a704c', '#5c4030'];
  const grass = ['#7cb342', '#8bc34a', '#689f38', '#9ccc65', '#6b9b37', '#558b2f'];
  TEX = {
    dirt: canvasTex(function (ctx) { fillNoise(ctx, 2, dirt); }),
    grassTop: canvasTex(function (ctx) { fillNoise(ctx, 1, grass); }),
    grassSide: canvasTex(function (ctx) {
      fillNoise(ctx, 2, dirt);
      const h = noise(3);
      for (let x = 0; x < 16; x++) {
        const lip = 3 + Math.floor(h(x, 0) * 3);
        for (let y = 0; y < lip; y++) {
          ctx.fillStyle = grass[Math.floor(h(x, y + 2) * grass.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }),
    stone: canvasTex(function (ctx) {
      fillNoise(ctx, 4, ['#7d7d7d', '#747474', '#8a8a8a', '#6a6a6a', '#818181', '#959595']);
      const h = noise(5);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = h(i, 3) > 0.5 ? '#9a9a9a' : '#5e5e5e';
        ctx.fillRect(Math.floor(h(i, 1) * 14), Math.floor(h(i, 2) * 14), 2, 2);
      }
    }),
    logSide: canvasTex(function (ctx) {
      const bands = ['#6b5030', '#4e3a22', '#5c4528', '#3f2e1a', '#7a5a34'];
      const h = noise(6);
      for (let x = 0; x < 16; x++) {
        ctx.fillStyle = bands[Math.floor(h(x, 0) * bands.length)];
        ctx.fillRect(x, 0, 1, 16);
      }
    }),
    logTop: canvasTex(function (ctx) {
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          const d = Math.hypot(x - 7.5, y - 7.5);
          ctx.fillStyle = d > 6.2 ? '#4e3a22' : d > 4.2 ? '#c4a36a' : d > 2.4 ? '#8d6840' : '#c4a36a';
          ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.fillStyle = '#3f2e1a';
      ctx.fillRect(7, 7, 2, 2);
    }),
    leaves: canvasTex(function (ctx) {
      const h = noise(7);
      const colors = ['#3a8c1e', '#2d6b16', '#4caf2a', '#215c10', '#56b832'];
      for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
          if (h(x >> 1, y >> 1) > 0.58) continue;
          ctx.fillStyle = colors[Math.floor(h(x, y) * colors.length)];
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }),
    water: canvasTex(function (ctx) {
      fillNoise(ctx, 8, ['#3f76e4', '#2e5fce', '#4d86ef', '#2554c4', '#5b94f5']);
    }),
  };
  return TEX;
}

function blockPaint(kind) {
  const t = textures();
  if (kind === 'grass') return { top: t.grassTop, bottom: t.dirt, side: t.grassSide };
  if (kind === 'dirt') return { all: t.dirt };
  if (kind === 'stone') return { all: t.stone };
  if (kind === 'leaf') return { all: t.leaves, soft: true };
  if (kind === 'log') return { top: t.logTop, bottom: t.logTop, side: t.logSide };
  if (kind === 'water') return { all: t.water };
  return { all: '#888' };
}

function cell(gx, gy, gz) {
  return {
    x: (gx - (COLS - 1) / 2) * S,
    y: gy * S,
    z: (gz - (ROWS - 1) / 2) * S,
  };
}

function makeBox(w, h, d, paint) {
  const box = document.createElement('div');
  box.style.cssText =
    'position:absolute;width:' + w + 'px;height:' + h + 'px;' +
    '-webkit-transform-style:preserve-3d;transform-style:preserve-3d;';
  const edge = paint.soft ? 'none' : 'inset 0 0 0 1px rgba(0,0,0,.45)';
  const border = paint.border || 'none';
  const specs = [
    ['front', w, h, 0, 0, 'rotateY(0deg) translateZ(' + d / 2 + 'px)'],
    ['back', w, h, 0, 0, 'rotateY(180deg) translateZ(' + d / 2 + 'px)'],
    ['right', d, h, (w - d) / 2, 0, 'rotateY(90deg) translateZ(' + w / 2 + 'px)'],
    ['left', d, h, (w - d) / 2, 0, 'rotateY(-90deg) translateZ(' + w / 2 + 'px)'],
    ['top', w, d, 0, (h - d) / 2, 'rotateX(90deg) translateZ(' + h / 2 + 'px)'],
    ['bottom', w, d, 0, (h - d) / 2, 'rotateX(-90deg) translateZ(' + h / 2 + 'px)'],
  ];
  specs.forEach(function (spec) {
    const key = spec[0];
    const fw = spec[1];
    const fh = spec[2];
    const left = spec[3];
    const top = spec[4];
    const tf = spec[5];
    const face = document.createElement('div');
    face.style.cssText =
      'position:absolute;width:' + fw + 'px;height:' + fh + 'px;left:' + left + 'px;top:' + top + 'px;' +
      '-webkit-backface-visibility:hidden;backface-visibility:hidden;box-sizing:border-box;' +
      'image-rendering:pixelated;box-shadow:' + edge + ';border:' + border + ';' +
      'background:' + (paint[key] || paint.side || paint.all || '#888') + ';' +
      'transform:' + tf + ';';
    box.appendChild(face);
  });
  return box;
}

function place(parent, box, cx, cy, cz, w, h) {
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;width:0;height:0;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;' +
    'transform:translate3d(' + (cx - w / 2) + 'px,' + (cy - h / 2) + 'px,' + cz + 'px);';
  wrap.appendChild(box);
  parent.appendChild(wrap);
  return wrap;
}

function addCrack(box) {
  const crack = document.createElement('div');
  crack.style.cssText =
    'position:absolute;left:0;top:0;width:' + S + 'px;height:' + S + 'px;pointer-events:none;' +
    'background:repeating-linear-gradient(45deg,transparent 0 5px,rgba(0,0,0,.8) 5px 6px),' +
    'repeating-linear-gradient(-45deg,transparent 0 7px,rgba(0,0,0,.7) 7px 8px);' +
    'transform:rotateX(90deg) translateZ(' + (S / 2 + 1) + 'px);' +
    '-webkit-backface-visibility:hidden;backface-visibility:hidden;opacity:0;';
  box.appendChild(crack);
  return crack;
}

/**
 * Blocky mob. Feet sit on the local origin. Y grows downward.
 * ponytail: 2-block-tall Steve, no slim arms. Upgrade path: 1.8-block skin model.
 */
function makeMob(world, opts, uid) {
  const root = document.createElement('div');
  root.style.cssText =
    'position:absolute;width:0;height:0;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;';
  const bob = document.createElement('div');
  bob.style.cssText =
    'position:absolute;width:0;height:0;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;';
  root.appendChild(bob);

  const skin = opts.skin || '#c6a27a';
  const hair = opts.hair || '#3b2414';
  const face = opts.face;
  // Camera looks down, so the top face is what you see. Steve's top is hair.
  // Everyone else wears their avatar on every side, or the head is a brown box.
  const shell = opts.steve ? hair : face;
  place(bob, makeBox(20, 20, 20, {
    top: shell,
    front: face,
    back: shell,
    side: shell,
    bottom: opts.steve ? skin : face,
  }), 0, -70, 0, 20, 20);
  place(bob, makeBox(20, 30, 10, { all: opts.shirt }), 0, -45, 0, 20, 30);

  const limbs = [];
  function limb(x, y, color, delay) {
    const hip = document.createElement('div');
    hip.style.cssText =
      'position:absolute;width:0;height:0;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;' +
      'transform:translate3d(' + x + 'px,' + y + 'px,0);';
    const rotor = document.createElement('div');
    rotor.style.cssText =
      'position:absolute;width:0;height:0;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;' +
      'transform-origin:0 0 0;';
    if (!opts.still) {
      rotor.style.animation = uid + '_step .4s linear infinite';
      rotor.style.animationDelay = delay + 's';
    }
    hip.appendChild(rotor);
    place(rotor, makeBox(10, 30, 10, { all: color }), 0, 15, 0, 10, 30);
    bob.appendChild(hip);
    limbs.push(rotor);
    return rotor;
  }

  limb(-5, -30, opts.pants, 0);
  limb(5, -30, opts.pants, -0.2);
  limb(-15, -60, opts.arm || opts.shirt, -0.2);
  const armR = limb(15, -60, opts.arm || opts.shirt, 0);
  if (opts.pick) makePickaxe(armR);

  world.appendChild(root);
  return { root, bob, limbs, armR };
}

const PICK_URL = new URL('./stone-pickaxe.png', import.meta.url).href;

function makePickaxe(arm) {
  const g = document.createElement('div');
  g.style.cssText =
    'position:absolute;width:0;height:0;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;' +
    'transform:translate3d(0px,26px,16px);';
  arm.appendChild(g);
  const face = document.createElement('img');
  face.src = PICK_URL;
  face.alt = '';
  face.draggable = false;
  // Handle butt is the lower-left of the png. It sits on the front of the fist (+Z).
  face.style.cssText =
    'position:absolute;width:48px;height:48px;left:-6px;top:-45px;' +
    'transform-origin:13% 93%;transform:rotateY(70deg) rotateZ(18deg);' +
    'image-rendering:pixelated;pointer-events:none;';
  g.appendChild(face);
}

function burst(world, x, y, z, color) {
  for (let i = 0; i < 8; i++) {
    const chip = document.createElement('div');
    const sz = 6 + (i % 3) * 2;
    chip.style.cssText =
      'position:absolute;width:' + sz + 'px;height:' + sz + 'px;left:' + -sz / 2 + 'px;top:' + -sz / 2 + 'px;' +
      'background:' + color + ';border:1px solid rgba(0,0,0,.45);';
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position:absolute;width:0;height:0;transform-style:preserve-3d;opacity:1;' +
      'transition:transform .5s ease-out,opacity .5s ease-out;' +
      'transform:translate3d(' + x + 'px,' + y + 'px,' + z + 'px);';
    wrap.appendChild(chip);
    world.appendChild(wrap);
    const dx = (Math.random() - 0.5) * S * 1.5;
    const dy = (Math.random() - 0.65) * S * 1.3;
    const dz = (Math.random() - 0.5) * S * 1.5;
    requestAnimationFrame(function () {
      wrap.style.transform =
        'translate3d(' + (x + dx) + 'px,' + (y + dy) + 'px,' + (z + dz) + 'px)';
      wrap.style.opacity = '0';
    });
    setTimeout(function () { wrap.remove(); }, 560);
  }
}

/** Overworld stroll, then a 3-block shaft. The pick is whoever was under the stone. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const uid = 'mc' + Math.floor(Math.random() * 1e9);
  const intro = 900;
  const digBeat = 860;
  const holdMs = 1100;
  const endX = DIG_X - 1;
  const steps = endX - START_X;
  const total = Math.max(CONFIG.spinDuration, intro + 2000 + SHAFT.length * digBeat + holdMs);
  const stepMs = Math.max(320, Math.round((total - intro - SHAFT.length * digBeat - holdMs) / steps));

  const decoys = order.filter(function (_, i) { return i !== targetIndex; });
  for (let i = decoys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = decoys[i];
    decoys[i] = decoys[j];
    decoys[j] = tmp;
  }
  const crowdXs = [2, 3, 4];
  const crowdZ = PATH_Z - 1;
  const spots = decoys.slice(0, 3).map(function (person, i) {
    return { person: person, x: crowdXs[i], z: crowdZ };
  });

  const headline = document.createElement('div');
  headline.textContent = 'Minecraft';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:26px;letter-spacing:4px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:min(720px,96vw);height:460px;overflow:hidden;' +
    'background:linear-gradient(180deg,#69b4f5 0%,#8ec8f7 46%,#c5e39a 100%);' +
    'border:5px solid #1b110a;border-radius:12px;box-shadow:0 24px 50px rgba(0,0,0,0.75);';
  overlay.appendChild(stage);

  const sun = document.createElement('div');
  sun.style.cssText =
    'position:absolute;right:48px;top:28px;width:58px;height:58px;border-radius:50%;z-index:0;' +
    'background:radial-gradient(circle,#fff8c4 0%,#ffe14a 42%,rgba(255,225,74,0) 72%);' +
    'box-shadow:0 0 36px rgba(255,214,70,.85);';
  stage.appendChild(sun);

  const viewport = document.createElement('div');
  viewport.style.cssText =
    'position:absolute;inset:0;z-index:1;perspective:980px;perspective-origin:50% 40%;';
  stage.appendChild(viewport);

  const world = document.createElement('div');
  world.style.cssText =
    'position:absolute;left:50%;top:44%;width:0;height:0;' +
    '-webkit-transform-style:preserve-3d;transform-style:preserve-3d;';
  viewport.appendChild(world);

  const boards = [];
  let pitch = 58;
  let yaw = -40;

  function billboardAll() {
    boards.forEach(function (bill) {
      bill.style.transform = 'rotateY(' + -yaw + 'deg) rotateX(' + -pitch + 'deg)';
    });
  }

  function setCam(x, y, z, nextPitch, nextYaw, pull) {
    pitch = nextPitch;
    yaw = nextYaw;
    world.style.transform =
      'translateY(28px) translateZ(' + pull + 'px) rotateX(' + pitch + 'deg) rotateY(' + yaw + 'deg) ' +
      'translate3d(' + -x + 'px,' + -y + 'px,' + -z + 'px)';
    billboardAll();
  }

  const water = { '9,5': 1, '10,5': 1, '9,6': 1, '10,6': 1 };
  const hills = { '4,0': 1, '2,6': 1, '8,2': 1 };
  const shaftBoxes = [];
  const cracks = [];

  for (let gx = 0; gx < COLS; gx++) {
    for (let gz = 0; gz < ROWS; gz++) {
      const key = gx + ',' + gz;
      const near =
        Math.abs(gx - DIG_X) <= 1 && Math.abs(gz - PATH_Z) <= 1;
      const c0 = cell(gx, 0, gz);
      if (water[key]) {
        const waterBox = makeBox(S, S * 0.72, S, blockPaint('water'));
        place(world, waterBox, c0.x, S * 0.22, c0.z, S, S * 0.72);
      } else {
        const grass = makeBox(S, S, S, blockPaint('grass', gx, gz));
        const gWrap = place(world, grass, c0.x, c0.y, c0.z, S, S);
        if (gx === DIG_X && gz === PATH_Z) {
          shaftBoxes[0] = grass;
          cracks[0] = addCrack(grass);
          grass._wrap = gWrap;
        }
        if (hills[key]) {
          const up = cell(gx, -1, gz);
          place(world, makeBox(S, S, S, blockPaint('grass', gx, gz)), up.x, up.y, up.z, S, S);
        }
      }
      const c1 = cell(gx, 1, gz);
      const dirt = makeBox(S, S, S, blockPaint('dirt'));
      const dWrap = place(world, dirt, c1.x, c1.y, c1.z, S, S);
      if (gx === DIG_X && gz === PATH_Z) {
        shaftBoxes[1] = dirt;
        cracks[1] = addCrack(dirt);
        dirt._wrap = dWrap;
      }
      if (near) {
        const c2 = cell(gx, 2, gz);
        const stone = makeBox(S, S, S, blockPaint('stone'));
        const sWrap = place(world, stone, c2.x, c2.y, c2.z, S, S);
        const floor = cell(gx, 3, gz);
        place(world, makeBox(S, S, S, blockPaint('stone')), floor.x, floor.y, floor.z, S, S);
        if (gx === DIG_X && gz === PATH_Z) {
          shaftBoxes[2] = stone;
          cracks[2] = addCrack(stone);
          stone._wrap = sWrap;
        }
      }
    }
  }

  [[0, 1], [9, 0], [7, 6]].forEach(function (pos) {
    const base = cell(pos[0], 0, pos[1]);
    place(world, makeBox(S, S, S, blockPaint('log')), base.x, -S, base.z, S, S);
    place(world, makeBox(S, S, S, blockPaint('log')), base.x, -2 * S, base.z, S, S);
    for (let lx = -1; lx <= 1; lx++) {
      for (let lz = -1; lz <= 1; lz++) {
        for (let ly = 0; ly < 2; ly++) {
          if (ly === 0 && Math.abs(lx) + Math.abs(lz) === 2) continue;
          place(
            world,
            makeBox(S, S, S, blockPaint('leaf')),
            base.x + lx * S,
            -2 * S - ly * S,
            base.z + lz * S,
            S,
            S
          );
        }
      }
    }
    place(world, makeBox(S, S, S, blockPaint('leaf')), base.x, -4 * S, base.z, S, S);
  });

  [[48, 58], [168, 36], [430, 48]].forEach(function (puff) {
    const cloud = document.createElement('div');
    cloud.style.cssText =
      'position:absolute;left:' + puff[0] + 'px;top:' + puff[1] + 'px;width:64px;height:22px;z-index:0;' +
      'background:#fff;border-radius:16px;opacity:.95;' +
      'box-shadow:22px 4px 0 #fff,40px -6px 0 #fff,-14px 6px 0 #fff;';
    stage.appendChild(cloud);
  });

  const tagStyle =
    'position:absolute;left:0;top:0;transform:translate(-50%,-120%);white-space:nowrap;' +
    'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;font-weight:700;color:#fff;' +
    'text-shadow:2px 2px 0 #3f3f3f,-1px -1px 0 #3f3f3f,1px -1px 0 #3f3f3f,-1px 1px 0 #3f3f3f;';

  function addTag(gx, gz, name, feetY) {
    const c = cell(gx, 0, gz);
    const anchor = document.createElement('div');
    anchor.style.cssText =
      'position:absolute;width:0;height:0;transform-style:preserve-3d;' +
      'transform:translate3d(' + c.x + 'px,' + (feetY - 90) + 'px,' + c.z + 'px);';
    const bill = document.createElement('div');
    bill.style.cssText = 'position:absolute;width:0;height:0;';
    const text = document.createElement('div');
    text.textContent = String(name).length > 14 ? String(name).slice(0, 13) + '\u2026' : String(name);
    text.style.cssText = tagStyle;
    bill.appendChild(text);
    anchor.appendChild(bill);
    world.appendChild(anchor);
    boards.push(bill);
    return anchor;
  }

  spots.forEach(function (spot, i) {
    const face = avatarPaint(spot.person.avatarUrl);
    const mob = makeMob(world, {
      face: face,
      hair: '#3b2414',
      shirt: SHIRTS[i % SHIRTS.length],
      pants: '#2c3a6e',
      still: true,
    }, uid);
    const c = cell(spot.x, 0, spot.z);
    mob.root.style.transform =
      'translate3d(' + c.x + 'px,' + -S / 2 + 'px,' + c.z + 'px) rotateY(210deg)';
    addTag(spot.x, spot.z, spot.person.name, -S / 2);
  });

  const steve = makeMob(world, {
    face: 'url("' + STEVE_FACE + '") center/cover no-repeat',
    hair: '#3b2414',
    shirt: '#3d8ec9',
    pants: '#2d3a8c',
    arm: '#3d8ec9',
    pick: true,
    steve: true,
  }, uid);
  const start = cell(START_X, 0, PATH_Z);
  steve.root.style.transform =
    'translate3d(' + start.x + 'px,' + -S / 2 + 'px,' + start.z + 'px) rotateY(-90deg)';

  const floorTop = cell(DIG_X, 3, PATH_Z).y - S / 2;
  const found = makeMob(world, {
    face: avatarPaint(winner.avatarUrl),
    hair: '#3b2414',
    shirt: '#f0c14a',
    pants: '#5a4632',
    still: true,
  }, uid);
  const digC = cell(DIG_X, 0, PATH_Z);
  found.root.style.transform =
    'translate3d(' + digC.x + 'px,' + floorTop + 'px,' + digC.z + 'px) rotateY(200deg) scale(0.001)';

  const foundTag = addTag(DIG_X, PATH_Z, winner.name, floorTop);
  foundTag.style.visibility = 'hidden';

  const outline = document.createElement('div');
  outline.style.cssText =
    'position:absolute;width:0;height:0;transform-style:preserve-3d;visibility:hidden;' +
    'transition:transform .35s ease-in-out;';
  const outlineSize = S + 6;
  outline.appendChild(makeBox(outlineSize, outlineSize, outlineSize, {
    all: 'transparent',
    soft: true,
    border: '2px solid rgba(255,255,255,.95)',
  }));
  world.appendChild(outline);

  const caption = document.createElement('div');
  caption.textContent = 'Overworld';
  caption.style.cssText =
    'position:absolute;left:12px;right:12px;top:12px;text-align:center;z-index:8;' +
    'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;font-weight:700;color:#fff;' +
    'text-shadow:2px 2px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;';
  stage.appendChild(caption);

  const cross = document.createElement('div');
  cross.style.cssText =
    'position:absolute;left:50%;top:46%;width:16px;height:16px;margin:-8px 0 0 -8px;z-index:8;opacity:0;';
  cross.innerHTML =
    '<div style="position:absolute;left:7px;top:0;width:2px;height:16px;background:#fff;box-shadow:0 0 0 1px #111;"></div>' +
    '<div style="position:absolute;left:0;top:7px;width:16px;height:2px;background:#fff;box-shadow:0 0 0 1px #111;"></div>';
  stage.appendChild(cross);

  const hotbar = document.createElement('div');
  hotbar.style.cssText =
    'position:absolute;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:3px;z-index:8;';
  for (let s = 0; s < 9; s++) {
    const slot = document.createElement('div');
    const selected = s === 0;
    slot.style.cssText =
      'width:40px;height:40px;box-sizing:border-box;background:rgba(0,0,0,.45);' +
      'border:' + (selected ? '3px solid #fff' : '3px solid #1a1a1a') + ';' +
      'display:flex;align-items:center;justify-content:center;';
    if (selected) {
      const icon = document.createElement('img');
      icon.src = PICK_URL;
      icon.alt = '';
      icon.draggable = false;
      icon.style.cssText = 'width:28px;height:28px;image-rendering:pixelated;';
      slot.appendChild(icon);
    }
    hotbar.appendChild(slot);
  }
  stage.appendChild(hotbar);

  const ach = document.createElement('div');
  ach.style.cssText =
    'position:absolute;right:16px;top:48px;display:flex;gap:10px;align-items:center;' +
    'background:rgba(20,20,20,.92);border:2px solid #555;padding:8px 12px 8px 8px;z-index:9;' +
    'transform:translateX(130%);opacity:0;';
  const achImg = document.createElement('img');
  achImg.src = winner.avatarUrl;
  achImg.alt = '';
  achImg.style.cssText = 'width:44px;height:44px;image-rendering:pixelated;border:2px solid #f0c14a;';
  const achText = document.createElement('div');
  const achTitle = document.createElement('div');
  achTitle.textContent = 'Achievement Get!';
  achTitle.style.cssText =
    'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;color:#ffff55;font-weight:700;';
  const achName = document.createElement('div');
  achName.textContent = winner.name;
  achName.style.cssText =
    'font-family:"JetBrains Mono",ui-monospace,monospace;font-size:14px;color:#fff;font-weight:700;';
  achText.appendChild(achTitle);
  achText.appendChild(achName);
  ach.appendChild(achImg);
  ach.appendChild(achText);
  stage.appendChild(ach);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + uid + '_step{0%,100%{transform:rotateX(28deg)}50%{transform:rotateX(-28deg)}}' +
    '@keyframes ' + uid + '_bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}' +
    '@keyframes ' + uid + '_shake{0%,100%{transform:translate3d(0,0,0)}25%{transform:translate3d(-3px,1px,2px)}50%{transform:translate3d(3px,-1px,-2px)}75%{transform:translate3d(-2px,2px,1px)}}' +
    '@keyframes ' + uid + '_ach{from{transform:translateX(130%);opacity:0}to{transform:translateX(0);opacity:1}}';
  document.head.appendChild(styleEl);

  steve.bob.style.animation = uid + '_bob .4s linear infinite';

  function moveSteve(gx) {
    const c = cell(gx, 0, PATH_Z);
    steve.root.style.transform =
      'translate3d(' + c.x + 'px,' + -S / 2 + 'px,' + c.z + 'px) rotateY(-90deg)';
  }

  function follow(gx, pull) {
    const c = cell(gx, 0, PATH_Z);
    setCam(c.x + S * 0.6, -S * 0.8, c.z + S * 0.35, -50, -30, pull);
  }

  function moveOutline(gy) {
    const c = cell(DIG_X, gy, PATH_Z);
    outline.style.transform =
      'translate3d(' + (c.x - outlineSize / 2) + 'px,' + (c.y - outlineSize / 2) + 'px,' + c.z + 'px)';
  }

  setCam(0, -S, 0, -58, -42, -160);
  document.body.appendChild(overlay);

  const wait = function (ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  };

  (async function () {
    try {
      await wait(40);
      world.style.transition = 'transform ' + intro + 'ms ease-in-out';
      steve.root.style.transition = 'transform ' + stepMs + 'ms linear';
      follow(START_X, 40);
      caption.textContent = 'Walking the overworld\u2026';
      await wait(intro);

      world.style.transition = 'transform ' + stepMs + 'ms linear';
      for (let x = START_X + 1; x <= endX; x++) {
        moveSteve(x);
        follow(x, 70);
        const spot = spots.find(function (s) { return s.x === x; });
        caption.textContent = spot ? spot.person.name : 'Walking the overworld\u2026';
        await wait(stepMs);
      }

      steve.bob.style.animation = 'none';
      steve.limbs.forEach(function (rotor) {
        rotor.style.animation = 'none';
        rotor.style.transform = 'rotateX(0deg)';
      });
      cross.style.opacity = '1';
      outline.style.visibility = 'visible';
      world.style.transition = 'transform .4s ease-in-out';
      caption.textContent = 'Dig here';
      await wait(280);

      for (let i = 0; i < SHAFT.length; i++) {
        const block = SHAFT[i];
        const c = cell(DIG_X, i, PATH_Z);
        setCam(c.x, c.y, c.z, -76, -22, 540 + i * 50);
        moveOutline(i);
        caption.textContent = 'Mining ' + block.label + ' (' + (i + 1) + '/3)';
        const arm = steve.armR;
        arm.style.transition = 'transform .14s ease-out';
        arm.style.transform = 'rotateX(-110deg)';
        await wait(160);
        arm.style.transition = 'transform .07s linear';
        arm.style.transform = 'rotateX(36deg)';
        cracks[i].style.opacity = '1';
        shaftBoxes[i].style.animation = uid + '_shake .22s linear';
        await wait(200);
        shaftBoxes[i].style.animation = 'none';
        shaftBoxes[i].style.transition = 'transform .2s ease-in,opacity .2s ease-in';
        shaftBoxes[i].style.transform = 'scale(0.12)';
        shaftBoxes[i].style.opacity = '0';
        const gone = shaftBoxes[i];
        setTimeout(function () { gone.style.visibility = 'hidden'; }, 220);
        burst(world, c.x, c.y, c.z, block.chip);
        await wait(digBeat - 360);
      }

      outline.style.visibility = 'hidden';
      cross.style.opacity = '0';
      setCam(digC.x, floorTop - 48, digC.z, -66, -26, 500);
      found.root.style.transition = 'transform .45s cubic-bezier(.2,1.35,.4,1)';
      found.root.style.transform =
        'translate3d(' + digC.x + 'px,' + floorTop + 'px,' + digC.z + 'px) rotateY(200deg) scale(1)';
      foundTag.style.visibility = 'visible';
      billboardAll();
      burst(world, digC.x, floorTop - 40, digC.z, '#7CFF3A');
      ach.style.animation = uid + '_ach .35s ease-out forwards';
      caption.textContent = winner.name;
      await wait(holdMs);
    } finally {
      if (overlay.isConnected) overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }
  })();
}
