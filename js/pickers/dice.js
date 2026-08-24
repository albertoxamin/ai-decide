import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'dice';
export const label = 'Dice';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const cubeSize = 240;
    const half = cubeSize / 2;

    const stage = document.createElement('div');
    stage.style.cssText = `width:${cubeSize}px;height:${cubeSize}px;position:relative;transform-style:preserve-3d;`;

    const cube = document.createElement('div');
    cube.style.cssText =
      `position:absolute;inset:0;transform-style:preserve-3d;` +
      `transition:transform ${CONFIG.spinDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1);` +
      `transform:rotateX(0deg) rotateY(0deg);`;
    stage.appendChild(cube);

    // Face order: winner on front; subsequent participants fill the remaining faces.
    const faceTransforms = [
      `translateZ(${half}px)`,                     // 0 front  (winner)
      `rotateY(180deg) translateZ(${half}px)`,     // 1 back
      `rotateY(90deg)  translateZ(${half}px)`,     // 2 right
      `rotateY(-90deg) translateZ(${half}px)`,     // 3 left
      `rotateX(90deg)  translateZ(${half}px)`,     // 4 top
      `rotateX(-90deg) translateZ(${half}px)`,     // 5 bottom
    ];
    const faceColors = ['#e9f2ff','#d6e4ff','#e9cdb6','#0cc846','#ff9500','#5856d6'];

    for (let i = 0; i < 6; i++) {
      const person = order[(targetIndex + i) % order.length];
      const face = document.createElement('div');
      face.style.cssText =
        `position:absolute;inset:0;transform:${faceTransforms[i]};` +
        `background:${faceColors[i]};border:3px solid #2a2a2a;border-radius:18px;` +
        `display:flex;flex-direction:column;align-items:center;justify-content:center;` +
        `gap:10px;font-size:15px;font-weight:600;color:#222;` +
        `box-shadow:inset 0 0 30px rgba(0,0,0,0.18);backface-visibility:hidden;`;

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 4px 8px rgba(0,0,0,0.2);';
      face.appendChild(img);

      const label = document.createElement('span');
      label.textContent = person.name;
      label.style.textShadow = '0 1px 2px rgba(255,255,255,0.5)';
      face.appendChild(label);

      cube.appendChild(face);
    }

    overlay.appendChild(stage);
    document.body.appendChild(overlay);

    // Tumble: random multiples of 360deg on each axis so the front face (winner) lands forward.
    const xSpins = 4 + Math.floor(Math.random() * 3);
    const ySpins = 5 + Math.floor(Math.random() * 3);
    setTimeout(() => {
      cube.style.transform = `rotateX(${xSpins * 360}deg) rotateY(${ySpins * 360}deg)`;
    }, 50);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Lotto / bingo ball drop picker. Balls bounce around a circular drum, then the winning
   *  ball ejects out the bottom and lands in a tray that reveals the name. */
