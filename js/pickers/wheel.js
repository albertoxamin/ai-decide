import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'wheel';
export const label = 'Wheel';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const size = CONFIG.wheelSize;
    const tickerSize = CONFIG.tickerSize;
    const num = order.length;
    const segmentAngle = 360 / num;

    const wheelContainer = document.createElement('div');
    wheelContainer.style.cssText =
      `position:relative;width:${size + 60}px;height:${size + 60 + tickerSize}px;` +
      'display:flex;align-items:center;justify-content:center;';
    overlay.appendChild(wheelContainer);

    // Outer wooden rim (does not rotate)
    const rim = document.createElement('div');
    rim.style.cssText =
      `position:absolute;width:${size + 50}px;height:${size + 50}px;border-radius:50%;` +
      'background:radial-gradient(circle at 35% 30%, #6b3a18, #2a1606 75%);' +
      'box-shadow:0 18px 40px rgba(0,0,0,0.55), inset 0 0 30px rgba(0,0,0,0.45);' +
      'top:' + (tickerSize + 5) + 'px;';
    wheelContainer.appendChild(rim);

    // Bulb ring on the rim
    const bulbRing = document.createElement('div');
    bulbRing.style.cssText =
      `position:absolute;width:${size + 40}px;height:${size + 40}px;border-radius:50%;` +
      'top:' + (tickerSize + 10) + 'px;pointer-events:none;';
    wheelContainer.appendChild(bulbRing);
    const bulbCount = 18;
    for (let b = 0; b < bulbCount; b++) {
      const a = (b / bulbCount) * Math.PI * 2;
      const bx = (size + 40) / 2 + ((size + 28) / 2) * Math.cos(a) - 6;
      const by = (size + 40) / 2 + ((size + 28) / 2) * Math.sin(a) - 6;
      const bulb = document.createElement('div');
      bulb.style.cssText =
        `position:absolute;left:${bx}px;top:${by}px;width:12px;height:12px;border-radius:50%;` +
        'background:radial-gradient(circle at 35% 35%, #fff5d6, #d99a2b 65%, #6b3a18);' +
        'box-shadow:0 0 8px rgba(255,210,120,0.7);' +
        `animation: wheelBulb 1.2s steps(1) ${(b * 70)}ms infinite;`;
      bulbRing.appendChild(bulb);
    }
    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes wheelBulb { 0%, 49% { filter: brightness(1); } 50%, 100% { filter: brightness(1.6); } }';
    document.head.appendChild(styleEl);

    // The rotating wheel itself
    const wheel = document.createElement('div');
    wheel.style.cssText =
      `position:absolute;width:${size}px;height:${size}px;border-radius:50%;` +
      'top:' + (tickerSize + 30) + 'px;' +
      'box-shadow:inset 0 0 0 4px #1b110a, inset 0 0 0 6px #d99a2b, inset 0 0 0 8px #1b110a, ' +
      '0 0 20px rgba(0,0,0,0.4);overflow:hidden;';

    // Conic-gradient pie. Build stops so segments are precise pie wedges.
    const palette = ['#c83a1e', '#f1e6cb', '#d99a2b', '#2c5d52', '#e35636', '#1b110a', '#fbf4dd'];
    const stops = [];
    for (let i = 0; i < num; i++) {
      const c = palette[i % palette.length];
      const a0 = segmentAngle * i;
      const a1 = segmentAngle * (i + 1);
      stops.push(`${c} ${a0}deg ${a1}deg`);
    }
    wheel.style.background = `conic-gradient(${stops.join(', ')})`;
    wheelContainer.appendChild(wheel);

    // SVG layer for crisp white dividers + labels (rotates with the wheel)
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;';

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2;

    for (let i = 0; i < num; i++) {
      const a = (segmentAngle * i - 90) * Math.PI / 180;
      const ex = cx + r * Math.cos(a);
      const ey = cy + r * Math.sin(a);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', String(cx));
      line.setAttribute('y1', String(cy));
      line.setAttribute('x2', String(ex));
      line.setAttribute('y2', String(ey));
      line.setAttribute('stroke', '#1b110a');
      line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
    }

    // Labels along each segment's midline
    order.forEach((person, i) => {
      const midDeg = segmentAngle * (i + 0.5);
      // Choose ink/paper text color based on segment fill for contrast
      const fill = palette[i % palette.length];
      const dark = ['#c83a1e', '#2c5d52', '#1b110a', '#e35636'].includes(fill);
      const textColor = dark ? '#fbf4dd' : '#1b110a';

      const g = document.createElementNS(ns, 'g');
      // Rotate so the segment's midline points to the right (0deg in SVG)
      // i.e. we want midDeg to align with east. Rotation = midDeg - 90 (since 0deg is east).
      g.setAttribute('transform', `translate(${cx} ${cy}) rotate(${midDeg - 90})`);

      // Avatar near the rim
      const labelRadius = r * 0.62;
      const img = document.createElementNS(ns, 'image');
      img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', person.avatarUrl);
      img.setAttribute('href', person.avatarUrl);
      img.setAttribute('x', String(labelRadius + 26));
      img.setAttribute('y', '-13');
      img.setAttribute('width', '26');
      img.setAttribute('height', '26');
      g.appendChild(img);

      const text = document.createElementNS(ns, 'text');
      text.textContent = String(person.name).slice(0, 14);
      text.setAttribute('x', String(labelRadius + 18));
      text.setAttribute('y', '5');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-family', '"Rye","Times New Roman",serif');
      text.setAttribute('font-size', num > 10 ? '13' : '16');
      text.setAttribute('fill', textColor);
      g.appendChild(text);

      svg.appendChild(g);
    });

    // Center hub
    const hub = document.createElementNS(ns, 'circle');
    hub.setAttribute('cx', String(cx));
    hub.setAttribute('cy', String(cy));
    hub.setAttribute('r', '22');
    hub.setAttribute('fill', '#d99a2b');
    hub.setAttribute('stroke', '#1b110a');
    hub.setAttribute('stroke-width', '3');
    svg.appendChild(hub);
    const hubDot = document.createElementNS(ns, 'circle');
    hubDot.setAttribute('cx', String(cx));
    hubDot.setAttribute('cy', String(cy));
    hubDot.setAttribute('r', '6');
    hubDot.setAttribute('fill', '#1b110a');
    svg.appendChild(hubDot);

    wheel.appendChild(svg);

    // Ticker / pointer at the top, pointing into the wheel
    const ticker = document.createElement('div');
    ticker.style.cssText =
      `position:absolute;top:${tickerSize - 6}px;left:50%;transform:translateX(-50%);` +
      `width:0;height:0;border-left:${tickerSize}px solid transparent;` +
      `border-right:${tickerSize}px solid transparent;` +
      `border-top:${tickerSize * 1.6}px solid #c83a1e;z-index:10;` +
      'filter:drop-shadow(0 2px 3px rgba(0,0,0,0.5));';
    wheelContainer.appendChild(ticker);
    // Small gold bead on the pointer tip
    const tip = document.createElement('div');
    tip.style.cssText =
      `position:absolute;top:${tickerSize - 18}px;left:50%;transform:translateX(-50%);` +
      'width:14px;height:14px;border-radius:50%;background:#d99a2b;' +
      'border:2px solid #1b110a;z-index:11;';
    wheelContainer.appendChild(tip);

    // Spin animation. conic-gradient starts at 12 o'clock (top) going clockwise, and the
    // ticker is also at the top, so no extra angular offset is needed — just rotate the
    // wheel clockwise so segment `targetIndex`'s midline lands under the ticker.
    const finalRotation =
      CONFIG.extraSpin - segmentAngle * targetIndex - segmentAngle / 2;

    wheel.style.transition = `transform ${CONFIG.spinDuration}ms cubic-bezier(0.33, 1, 0.68, 1)`;
    setTimeout(() => {
      wheel.style.transform = `rotate(${finalRotation}deg)`;
    }, 50);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);

    document.body.appendChild(overlay);
  }

  /** 3D dice roll picker. Builds a CSS cube with up to 6 participants on its faces (winner
   *  is on the front face), tumbles it for `CONFIG.spinDuration`, then settles with the
   *  winner facing the camera. */
