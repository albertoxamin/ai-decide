import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'f1';
export const label = 'F1 race';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const w = 720;
    const h = 360;
    // Local duration: F1 looks better with a bit more time to enjoy the laps.
    const f1Duration = Math.max(CONFIG.spinDuration, 4000);
    const numLaps = 2;

    // Stadium path generator: positive L = outer lane, negative L = inner lane.
    const stadiumPath = (L) =>
      `M 170,${40 - L} L 550,${40 - L} ` +
      `A ${140 + L},${140 + L} 0 0 1 550,${320 + L} ` +
      `L 170,${320 + L} ` +
      `A ${140 + L},${140 + L} 0 0 1 170,${40 - L} Z`;

    const stage = document.createElement('div');
    stage.style.cssText =
      `position:relative;width:${w}px;height:${h}px;background:#3d8b3d;` +
      `border-radius:14px;overflow:hidden;border:3px solid #1a1a1a;box-shadow:0 0 30px rgba(0,0,0,0.5);`;

    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(h));
    svg.style.cssText = 'position:absolute;inset:0;';

    // White curb (wide stroke gives the track a coloured border).
    const curb = document.createElementNS(ns, 'path');
    curb.setAttribute('d', stadiumPath(0));
    curb.setAttribute('fill', 'none');
    curb.setAttribute('stroke', '#fff');
    curb.setAttribute('stroke-width', '88');
    svg.appendChild(curb);

    // Asphalt — wide enough to comfortably hold all the lanes.
    const asphalt = document.createElementNS(ns, 'path');
    asphalt.setAttribute('d', stadiumPath(0));
    asphalt.setAttribute('fill', 'none');
    asphalt.setAttribute('stroke', '#3a3a3a');
    asphalt.setAttribute('stroke-width', '78');
    svg.appendChild(asphalt);

    // Dashed centre line
    const center = document.createElementNS(ns, 'path');
    center.setAttribute('d', stadiumPath(0));
    center.setAttribute('fill', 'none');
    center.setAttribute('stroke', '#fff');
    center.setAttribute('stroke-width', '2');
    center.setAttribute('stroke-dasharray', '10 16');
    center.setAttribute('stroke-opacity', '0.55');
    svg.appendChild(center);

    // Start / finish checker line
    const finishLine = document.createElementNS(ns, 'rect');
    finishLine.setAttribute('x', '165');
    finishLine.setAttribute('y', '0');
    finishLine.setAttribute('width', '10');
    finishLine.setAttribute('height', '84');
    finishLine.setAttribute('fill', '#fff');
    finishLine.setAttribute('stroke', '#000');
    finishLine.setAttribute('stroke-width', '1');
    finishLine.setAttribute('stroke-dasharray', '6 6');
    svg.appendChild(finishLine);

    stage.appendChild(svg);

    const carColors = ['#ff3b30','#0066cc','#ffcc00','#ffffff','#ff9500','#34c759','#5856d6','#af52de','#0cc846','#e81dbb'];
    const carData = [];
    const lanes = order.length;
    const laneSpacing = Math.min(8, 60 / Math.max(1, lanes - 1));

    // Shuffle which car/lane each driver gets so the winner can be any colour or lane.
    const layout = order.map((_, i) => i);
    for (let i = layout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [layout[i], layout[j]] = [layout[j], layout[i]];
    }

    layout.forEach((orderIdx, visualIdx) => {
      const person = order[orderIdx];
      const car = document.createElement('div');
      const color = carColors[visualIdx % carColors.length];
      const isWinner = orderIdx === targetIndex;
      const laneOffset = (visualIdx - (lanes - 1) / 2) * laneSpacing;

      car.style.cssText =
        'position:absolute;left:0;top:0;width:60px;height:28px;border-radius:8px 14px 14px 8px;' +
        `background:linear-gradient(180deg,${color},${color}cc);` +
        'border:1.5px solid rgba(0,0,0,0.6);box-shadow:0 3px 6px rgba(0,0,0,0.6);' +
        'display:flex;align-items:center;justify-content:flex-start;padding-left:5px;';
      car.style.offsetPath = `path("${stadiumPath(laneOffset)}")`;
      car.style.offsetRotate = 'auto';
      car.style.offsetDistance = '0%';
      car.style.offsetAnchor = 'center';

      const helmet = document.createElement('img');
      helmet.src = person.avatarUrl;
      helmet.style.cssText = 'width:22px;height:22px;border-radius:50%;object-fit:cover;border:1.5px solid rgba(0,0,0,0.4);';
      car.appendChild(helmet);

      stage.appendChild(car);

      // Winner does exactly numLaps full laps; others lag by 2-22% so they're behind on
      // the final bend / approaching the finish line.
      const finalPct = isWinner ? numLaps * 100 : numLaps * 100 - 2 - Math.random() * 20;
      carData.push({ car, finalPct });
    });

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // rAF loop: wrap with modulo so cars cleanly continue around the closed path.
    const startT = performance.now();
    let raf = 0;
    const step = (now) => {
      const t = Math.min(1, (now - startT) / f1Duration);
      carData.forEach(({ car, finalPct }) => {
        car.style.offsetDistance = `${(finalPct * t) % 100}%`;
      });
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    setTimeout(() => {
      cancelAnimationFrame(raf);
      overlay.remove();
      revealWinner(order, targetIndex);
    }, f1Duration + 100);
  }

  /** Hacking terminal: monospace green-on-black, fake "ACCESSING DATABASE..." log scrolls
   *  line by line, ends with "ACCESS GRANTED // SPEAKER: <winner>" and a blinking cursor. */
