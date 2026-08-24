import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'horses';
export const label = 'Horse race';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();

    const trackW = 620;
    const laneH = 52;
    const trackPadTop = 24;
    const totalH = order.length * laneH + trackPadTop + 12;
    const finishX = trackW - 50;

    const track = document.createElement('div');
    track.style.cssText =
      `position:relative;width:${trackW}px;height:${totalH}px;` +
      `background:linear-gradient(180deg,#87ceeb 0%,#87ceeb ${(trackPadTop / totalH) * 100}%,#7cfc00 ${(trackPadTop / totalH) * 100}%,#5fb800 100%);` +
      `border-radius:10px;border:3px solid #333;overflow:hidden;box-shadow:0 0 30px rgba(0,0,0,0.4);`;

    const finishLine = document.createElement('div');
    finishLine.style.cssText =
      `position:absolute;left:${finishX}px;top:0;bottom:0;width:10px;` +
      `background:repeating-linear-gradient(180deg,#fff 0,#fff 10px,#000 10px,#000 20px);z-index:1;`;
    track.appendChild(finishLine);

    const finishFlag = document.createElement('div');
    finishFlag.textContent = '🏁';
    finishFlag.style.cssText = `position:absolute;left:${finishX - 8}px;top:-2px;font-size:22px;z-index:2;`;
    track.appendChild(finishFlag);

    // Shuffle the lane assignment so the winner doesn't always end up in the top lane.
    const laneLayout = order.map((_, i) => i);
    for (let i = laneLayout.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [laneLayout[i], laneLayout[j]] = [laneLayout[j], laneLayout[i]];
    }

    const horses = [];
    laneLayout.forEach((orderIdx, laneIdx) => {
      const person = order[orderIdx];
      const lane = document.createElement('div');
      lane.style.cssText =
        `position:absolute;left:0;right:0;top:${trackPadTop + laneIdx * laneH}px;height:${laneH}px;` +
        `border-bottom:1px dashed rgba(0,0,0,0.25);`;

      const horse = document.createElement('div');
      // Per-horse easing varies the speed profile so the race doesn't look mechanical.
      const easeY = 0.3 + Math.random() * 0.5;
      horse.style.cssText =
        `position:absolute;left:8px;top:8px;display:flex;align-items:center;gap:4px;font-size:24px;z-index:2;` +
        `transition:left ${CONFIG.spinDuration - 100}ms cubic-bezier(0.3, ${easeY.toFixed(2)}, 0.7, 1);`;

      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.3);';
      const horseEmoji = document.createElement('span');
      horseEmoji.textContent = '🐎';
      const nameTag = document.createElement('span');
      nameTag.textContent = person.name.split(' ')[0].slice(0, 10);
      nameTag.style.cssText = 'font-size:11px;font-weight:700;color:#222;background:rgba(255,255,255,0.85);padding:2px 6px;border-radius:4px;';

      horse.appendChild(img);
      horse.appendChild(horseEmoji);
      horse.appendChild(nameTag);
      lane.appendChild(horse);
      track.appendChild(lane);
      horses.push({ horse, isWinner: orderIdx === targetIndex });
    });

    overlay.appendChild(track);
    document.body.appendChild(overlay);

    setTimeout(() => {
      horses.forEach(({ horse, isWinner }) => {
        const finalX = isWinner
          ? finishX - 22                          // winner crosses (and slightly past) the line
          : finishX - 80 - Math.random() * 110;   // others lag at varying distances
        horse.style.left = `${finalX}px`;
      });
    }, 50);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Fortune cookie: emoji cookie shakes, then disappears as a fortune slip slides up
   *  bearing the winner's name + a row of "lucky numbers". */
