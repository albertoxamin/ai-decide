import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'f1';
export const label = 'F1 race';

const TEAM_COLORS = [
  '#e10600', '#00a0de', '#00d2be', '#ff8000', '#229971',
  '#27f4d2', '#6692ff', '#b6babd', '#fcd700', '#c1121f',
];

function stadiumPath(left, top, right, bottom, r, L) {
  return (
    'M ' + left + ',' + (top - L) +
    ' L ' + right + ',' + (top - L) +
    ' A ' + (r + L) + ',' + (r + L) + ' 0 0 1 ' + right + ',' + (bottom + L) +
    ' L ' + left + ',' + (bottom + L) +
    ' A ' + (r + L) + ',' + (r + L) + ' 0 0 1 ' + left + ',' + (top - L) + ' Z'
  );
}

function makeCar(person, color) {
  const car = document.createElement('div');
  car.style.cssText =
    'position:absolute;left:0;top:0;width:88px;height:32px;pointer-events:none;' +
    'offset-anchor:50% 50%;will-change:offset-distance;';

  const body = document.createElement('div');
  body.style.cssText = 'position:absolute;inset:0;filter:drop-shadow(0 3px 3px rgba(0,0,0,0.55));';
  body.innerHTML =
    // rear wing
    '<div style="position:absolute;left:0;top:4px;width:8px;height:24px;background:#1a1a1a;' +
    'border:1.5px solid #0a0a0a;border-radius:1px;"></div>' +
    // rear tires
    '<div style="position:absolute;left:9px;top:0;width:15px;height:8px;background:#111;border-radius:2px;border:1px solid #000;"></div>' +
    '<div style="position:absolute;left:9px;bottom:0;width:15px;height:8px;background:#111;border-radius:2px;border:1px solid #000;"></div>' +
    // sidepods / chassis
    '<div style="position:absolute;left:14px;top:7px;width:44px;height:18px;' +
    'background:linear-gradient(180deg,' + color + ' 0%,#111 48%,' + color + ' 100%);' +
    'border:1.5px solid #0a0a0a;border-radius:5px 14px 14px 5px;"></div>' +
    // halo
    '<div style="position:absolute;left:32px;top:9px;width:20px;height:14px;border:2px solid #cfd3d8;' +
    'border-bottom:none;border-radius:10px 10px 0 0;pointer-events:none;"></div>' +
    // nose
    '<div style="position:absolute;left:56px;top:13px;width:28px;height:6px;' +
    'background:linear-gradient(90deg,' + color + ',#222);border:1.5px solid #0a0a0a;' +
    'border-left:none;border-radius:0 8px 8px 0;"></div>' +
    // front wing
    '<div style="position:absolute;left:78px;top:7px;width:10px;height:18px;background:#1a1a1a;' +
    'border:1.5px solid #0a0a0a;border-radius:1px;"></div>' +
    // front tires
    '<div style="position:absolute;left:60px;top:0;width:14px;height:7px;background:#111;border-radius:2px;border:1px solid #000;"></div>' +
    '<div style="position:absolute;left:60px;bottom:0;width:14px;height:7px;background:#111;border-radius:2px;border:1px solid #000;"></div>' +
    // number plate flash
    '<div style="position:absolute;left:18px;top:12px;width:9px;height:7px;background:rgba(255,255,255,0.35);border-radius:1px;"></div>';
  car.appendChild(body);

  const helmet = document.createElement('img');
  helmet.src = person.avatarUrl;
  helmet.alt = '';
  helmet.style.cssText =
    'position:absolute;left:34px;top:7px;width:18px;height:18px;border-radius:50%;' +
    'object-fit:cover;border:1.5px solid #0a0a0a;background:#fbf4dd;z-index:2;';
  car.appendChild(helmet);
  return car;
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

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/** Night GP: start lights, kerbs, top-down cars on a stadium circuit, then the winner takes the flag. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const winner = order[targetIndex];
  const totalMs = Math.max(CONFIG.spinDuration, 4800);
  const lightsMs = Math.min(1500, Math.round(totalMs * 0.24));
  const raceMs = totalMs - lightsMs;
  const numLaps = 2;
  const uid = 'f1_' + Date.now();
  const ns = 'http://www.w3.org/2000/svg';

  const headline = document.createElement('div');
  headline.textContent = 'Grand Prix';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:28px;letter-spacing:5px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 #1b110a;text-transform:uppercase;';
  overlay.appendChild(headline);

  const w = 860;
  const h = 470;
  const left = 218;
  const right = 642;
  const top = 86;
  const bottom = 384;
  const r = (bottom - top) / 2;
  const path0 = stadiumPath(left, top, right, bottom, r, 0);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + uid + '_crowd { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-2px) } }';
  document.head.appendChild(styleEl);

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;width:' + w + 'px;height:' + h + 'px;overflow:hidden;' +
    'background:linear-gradient(180deg,#0a1220 0%,#14243a 42%,#0d1a28 100%);' +
    'border:6px solid #1b110a;border-radius:14px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.75), inset 0 0 0 4px #d99a2b;';
  overlay.appendChild(stage);

  const caption = document.createElement('div');
  caption.textContent = 'Lights out and away we go';
  caption.style.cssText =
    'position:absolute;left:16px;right:16px;top:8px;text-align:center;z-index:12;' +
    'font-family:"Fraunces",Georgia,serif;font-size:13px;font-style:italic;color:#f6e27a;' +
    'text-shadow:0 1px 3px #000;';
  stage.appendChild(caption);

  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  svg.style.cssText = 'position:absolute;inset:0;z-index:1;';

  const defs = document.createElementNS(ns, 'defs');
  const glow = document.createElementNS(ns, 'radialGradient');
  glow.setAttribute('id', uid + '_glow');
  glow.innerHTML =
    '<stop offset="0%" stop-color="#ffe9a8" stop-opacity="0.22"/>' +
    '<stop offset="100%" stop-color="#ffe9a8" stop-opacity="0"/>';
  defs.appendChild(glow);
  svg.appendChild(defs);

  // Runoff grass (stroke around the circuit — night sky stays in the corners)
  const runoff = document.createElementNS(ns, 'path');
  runoff.setAttribute('d', path0);
  runoff.setAttribute('fill', 'none');
  runoff.setAttribute('stroke', '#1a4a28');
  runoff.setAttribute('stroke-width', '168');
  svg.appendChild(runoff);
  const runoffInner = document.createElementNS(ns, 'path');
  runoffInner.setAttribute('d', path0);
  runoffInner.setAttribute('fill', 'none');
  runoffInner.setAttribute('stroke', '#163d22');
  runoffInner.setAttribute('stroke-width', '128');
  svg.appendChild(runoffInner);

  function standBlock(x, y, sw, sh, vertical) {
    const roof = document.createElementNS(ns, 'rect');
    roof.setAttribute('x', String(x - 4));
    roof.setAttribute('y', String(y - 8));
    roof.setAttribute('width', String(sw + 8));
    roof.setAttribute('height', vertical ? String(sh + 12) : '14');
    if (vertical) {
      roof.setAttribute('x', String(x - 6));
      roof.setAttribute('width', '16');
      roof.setAttribute('height', String(sh + 8));
    }
    roof.setAttribute('rx', '3');
    roof.setAttribute('fill', '#1b110a');
    svg.appendChild(roof);
    const body = document.createElementNS(ns, 'rect');
    body.setAttribute('x', String(x));
    body.setAttribute('y', String(y));
    body.setAttribute('width', String(sw));
    body.setAttribute('height', String(sh));
    body.setAttribute('rx', '3');
    body.setAttribute('fill', '#3a241c');
    body.setAttribute('stroke', '#1b110a');
    svg.appendChild(body);
    const seats = document.createElementNS(ns, 'rect');
    seats.setAttribute('x', String(x + 3));
    seats.setAttribute('y', String(y + 3));
    seats.setAttribute('width', String(sw - 6));
    seats.setAttribute('height', String(sh - 6));
    seats.setAttribute('fill', '#6a3228');
    seats.setAttribute('stroke', '#c45a3a');
    seats.setAttribute('stroke-width', '1.4');
    seats.setAttribute('stroke-dasharray', vertical ? '3 4' : '5 4');
    svg.appendChild(seats);
  }
  standBlock(8, 78, 58, 314, true);
  standBlock(794, 78, 58, 314, true);
  standBlock(200, 6, 460, 26, false);
  standBlock(200, 438, 460, 26, false);

  // Infield
  const infield = document.createElementNS(ns, 'path');
  infield.setAttribute('d', stadiumPath(left, top, right, bottom, r, -52));
  infield.setAttribute('fill', '#14532d');
  infield.setAttribute('stroke', '#0d2816');
  infield.setAttribute('stroke-width', '2');
  svg.appendChild(infield);

  // Floodlight cones (on top of grass)
  for (const [cx, cy] of [[70, 50], [430, 18], [790, 50], [70, 420], [790, 420]]) {
    const wash = document.createElementNS(ns, 'circle');
    wash.setAttribute('cx', String(cx));
    wash.setAttribute('cy', String(cy));
    wash.setAttribute('r', '110');
    wash.setAttribute('fill', 'url(#' + uid + '_glow)');
    svg.appendChild(wash);
  }

  // Red/white kerbs (wide stroke under asphalt)
  const kerb = document.createElementNS(ns, 'path');
  kerb.setAttribute('d', path0);
  kerb.setAttribute('fill', 'none');
  kerb.setAttribute('stroke', '#f4f4f4');
  kerb.setAttribute('stroke-width', '96');
  svg.appendChild(kerb);
  const kerbRed = document.createElementNS(ns, 'path');
  kerbRed.setAttribute('d', path0);
  kerbRed.setAttribute('fill', 'none');
  kerbRed.setAttribute('stroke', '#e10600');
  kerbRed.setAttribute('stroke-width', '96');
  kerbRed.setAttribute('stroke-dasharray', '18 18');
  svg.appendChild(kerbRed);

  // Asphalt
  const asphalt = document.createElementNS(ns, 'path');
  asphalt.setAttribute('d', path0);
  asphalt.setAttribute('fill', 'none');
  asphalt.setAttribute('stroke', '#3a3c40');
  asphalt.setAttribute('stroke-width', '78');
  svg.appendChild(asphalt);
  const asphaltSheen = document.createElementNS(ns, 'path');
  asphaltSheen.setAttribute('d', path0);
  asphaltSheen.setAttribute('fill', 'none');
  asphaltSheen.setAttribute('stroke', '#4a4d52');
  asphaltSheen.setAttribute('stroke-width', '28');
  asphaltSheen.setAttribute('stroke-opacity', '0.45');
  svg.appendChild(asphaltSheen);

  // Dashed centre line
  const center = document.createElementNS(ns, 'path');
  center.setAttribute('d', path0);
  center.setAttribute('fill', 'none');
  center.setAttribute('stroke', '#d8d8d8');
  center.setAttribute('stroke-width', '2');
  center.setAttribute('stroke-dasharray', '12 14');
  center.setAttribute('stroke-opacity', '0.55');
  svg.appendChild(center);

  // Start / finish: checker band across the top straight
  const finishX = left + 8;
  const finishY = top - 39;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 2; col++) {
      const sq = document.createElementNS(ns, 'rect');
      sq.setAttribute('x', String(finishX + col * 7));
      sq.setAttribute('y', String(finishY + row * 10));
      sq.setAttribute('width', '7');
      sq.setAttribute('height', '10');
      sq.setAttribute('fill', (row + col) % 2 === 0 ? '#fbf4dd' : '#1b110a');
      svg.appendChild(sq);
    }
  }

  stage.appendChild(svg);

  // Seat speckles (crowd)
  const crowd = document.createElement('div');
  crowd.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none;overflow:hidden;';
  const crowdSpots = [
    [12, 84, 50, 300],
    [800, 84, 50, 300],
    [210, 10, 440, 18],
    [210, 442, 440, 18],
  ];
  crowdSpots.forEach((box, bi) => {
    for (let i = 0; i < 40; i++) {
      const dot = document.createElement('div');
      const palette = ['#e10600', '#f6e27a', '#fbf4dd', '#00d2be', '#6692ff', '#ff8000'];
      dot.style.cssText =
        'position:absolute;width:4px;height:4px;border-radius:50%;' +
        'left:' + (box[0] + Math.random() * box[2]) + 'px;' +
        'top:' + (box[1] + Math.random() * box[3]) + 'px;' +
        'background:' + palette[(i + bi) % palette.length] + ';' +
        'animation:' + uid + '_crowd ' + (1.2 + Math.random()) + 's ease-in-out ' +
        (Math.random() * 0.8) + 's infinite;';
      crowd.appendChild(dot);
    }
  });
  stage.appendChild(crowd);

  // Infield HUD + start-light gantry (kept off the racing line)
  const hud = document.createElement('div');
  hud.style.cssText =
    'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:15;' +
    'width:210px;pointer-events:none;display:flex;flex-direction:column;align-items:center;';

  const gantry = document.createElement('div');
  gantry.style.cssText =
    'display:flex;gap:8px;padding:8px 14px;background:#1b110a;border-radius:8px;margin-bottom:10px;' +
    'border:2px solid #d99a2b;box-shadow:0 6px 16px rgba(0,0,0,0.5);transition:opacity 0.25s ease;';
  const bulbs = [];
  for (let i = 0; i < 5; i++) {
    const bulb = document.createElement('div');
    bulb.style.cssText =
      'width:18px;height:18px;border-radius:50%;background:#2a1515;border:2px solid #4a2020;';
    gantry.appendChild(bulb);
    bulbs.push(bulb);
  }
  hud.appendChild(gantry);

  const lapBadge = document.createElement('div');
  lapBadge.textContent = 'FORMATION';
  lapBadge.style.cssText =
    'text-align:center;font-family:"JetBrains Mono","Menlo",monospace;font-size:11px;' +
    'letter-spacing:3px;color:#f6e27a;margin-bottom:8px;text-shadow:0 1px 2px #000;';
  hud.appendChild(lapBadge);
  const board = document.createElement('div');
  board.style.cssText =
    'background:rgba(10,14,22,0.72);border:1px solid rgba(246,226,122,0.35);' +
    'border-radius:8px;padding:8px 10px;backdrop-filter:blur(4px);';
  hud.appendChild(board);
  stage.appendChild(hud);

  const lanes = order.length;
  const laneSpacing = Math.min(9, 54 / Math.max(1, lanes - 1));
  const layout = shuffle(order.map((_, i) => i));
  const cars = [];

  layout.forEach((orderIdx, visualIdx) => {
    const person = order[orderIdx];
    const color = TEAM_COLORS[visualIdx % TEAM_COLORS.length];
    const isWinner = orderIdx === targetIndex;
    const laneOffset = (visualIdx - (lanes - 1) / 2) * laneSpacing;
    const car = makeCar(person, color);
    const d = stadiumPath(left, top, right, bottom, r, laneOffset);
    car.style.offsetPath = 'path("' + d + '")';
    car.style.offsetRotate = 'auto';
    car.style.offsetDistance = '0%';
    car.style.zIndex = String(10 + visualIdx);
    stage.appendChild(car);

    const gridPct = 2 + visualIdx * Math.min(2.6, 18 / Math.max(1, lanes));
    const finalPct = isWinner
      ? numLaps * 100
      : numLaps * 100 - 6 - Math.random() * 16;
    cars.push({
      car,
      person,
      color,
      isWinner,
      gridPct,
      finalPct,
      freq: 2.2 + Math.random() * 2.4,
      phase: Math.random() * Math.PI * 2,
      amp: 4 + Math.random() * 5,
    });
  });

  cars.forEach((c) => {
    c.car.style.offsetDistance = (c.gridPct % 100) + '%';
  });

  function renderBoard(list) {
    board.innerHTML = '';
    list.slice(0, Math.min(6, list.length)).forEach((c, i) => {
      const row = document.createElement('div');
      row.style.cssText =
        'display:flex;align-items:center;gap:6px;margin:3px 0;font-family:"JetBrains Mono","Menlo",monospace;' +
        'font-size:11px;color:#fbf4dd;';
      const pos = document.createElement('span');
      pos.textContent = 'P' + (i + 1);
      pos.style.cssText = 'width:22px;color:' + (i === 0 ? '#f6e27a' : '#aaa') + ';font-weight:700;';
      const pip = document.createElement('span');
      pip.style.cssText = 'width:8px;height:8px;border-radius:1px;background:' + c.color + ';flex-shrink:0;';
      const name = document.createElement('span');
      name.textContent = String(c.person.name).split(' ')[0].slice(0, 10);
      name.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      row.appendChild(pos);
      row.appendChild(pip);
      row.appendChild(name);
      board.appendChild(row);
    });
  }
  renderBoard(cars.slice().sort((a, b) => a.gridPct - b.gridPct));

  document.body.appendChild(overlay);

  bulbs.forEach((bulb, i) => {
    setTimeout(() => {
      bulb.style.background = '#e10600';
      bulb.style.boxShadow = '0 0 12px #e10600';
      bulb.style.borderColor = '#ff6b6b';
    }, Math.round((lightsMs * 0.72) * (i / 5)));
  });
  setTimeout(() => {
    bulbs.forEach((bulb) => {
      bulb.style.background = '#1a0808';
      bulb.style.boxShadow = 'none';
      bulb.style.borderColor = '#3a1515';
    });
    caption.textContent = 'Lights out and away we go';
    lapBadge.textContent = 'LAP 1 / ' + numLaps;
    gantry.style.opacity = '0.35';
  }, lightsMs);

  const startT = performance.now() + lightsMs;
  let raf = 0;
  const step = (now) => {
    const t = Math.min(1, Math.max(0, (now - startT) / raceMs));
    if (t > 0) {
      const eased = smoothstep(t);
      const ranked = [];
      cars.forEach((c) => {
        const wobble = Math.sin(t * Math.PI * c.freq + c.phase) * c.amp * (1 - t) * (t > 0.08 ? 1 : t / 0.08);
        const dist = c.gridPct + (c.finalPct - c.gridPct) * eased + wobble;
        c.car.style.offsetDistance = (dist % 100) + '%';
        ranked.push({ c, dist });
      });
      ranked.sort((a, b) => b.dist - a.dist);
      renderBoard(ranked.map((x) => x.c));
      const leadLaps = ranked[0] ? ranked[0].dist / 100 : 0;
      const lapNum = Math.min(numLaps, Math.max(1, Math.floor(leadLaps) + 1));
      if (t > 0.02) lapBadge.textContent = 'LAP ' + lapNum + ' / ' + numLaps;
      if (t > 0.92) {
        caption.textContent = winner.name.split(' ')[0] + ' takes the flag';
        lapBadge.textContent = 'FINISH';
      }
    }
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);

  setTimeout(() => {
    cancelAnimationFrame(raf);
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, totalMs + 120);
}
