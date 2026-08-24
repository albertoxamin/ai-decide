import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'strongman';
export const label = 'High Striker';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const totalMs = CONFIG.spinDuration;
    const num = order.length;

    // Layout
    const stageW = 380;
    const towerW = 130;
    const zoneH = Math.max(20, Math.min(60, Math.floor(440 / num)));
    const usedTowerH = zoneH * num;
    const towerTop = 90;
    const towerLeft = (stageW - towerW) / 2;
    const stageH = towerTop + usedTowerH + 110;
    const bellSize = 76;
    const puckSize = 26;
    const padH = 18;

    const headline = document.createElement('div');
    headline.textContent = 'Test Your Strength';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
    overlay.appendChild(headline);

    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;';
    overlay.appendChild(stage);

    // Tower frame
    const tower = document.createElement('div');
    tower.style.cssText =
      'position:absolute;left:' + towerLeft + 'px;top:' + towerTop + 'px;' +
      'width:' + towerW + 'px;height:' + usedTowerH + 'px;' +
      'background:linear-gradient(180deg, #6b3a18, #4a2810);' +
      'border:3px solid #1b110a;border-radius:6px;' +
      'box-shadow:inset 0 0 0 2px #d99a2b, 0 14px 28px rgba(0,0,0,0.55);';
    stage.appendChild(tower);

    // Bell at top (pivots from its top — hangs from an invisible bar)
    const bell = document.createElement('div');
    bell.style.cssText =
      'position:absolute;left:' + ((stageW - bellSize) / 2) + 'px;' +
      'top:' + (towerTop - bellSize - 6) + 'px;' +
      'width:' + bellSize + 'px;height:' + bellSize + 'px;transform-origin:50% 0%;';
    bell.innerHTML =
      '<div style="position:absolute;left:50%;top:-2px;width:14px;height:12px;' +
      'transform:translateX(-50%);background:#1b110a;border-radius:6px 6px 0 0;"></div>' +
      '<div style="position:absolute;left:0;top:8px;width:100%;height:86%;' +
      'border-radius:50% 50% 28% 28%;' +
      'background:radial-gradient(circle at 32% 24%, #ffd86b, #b87c1a 65%, #6b3a18);' +
      'box-shadow:0 8px 18px rgba(0,0,0,0.55), inset 0 -10px 16px rgba(0,0,0,0.35);"></div>' +
      '<div style="position:absolute;left:50%;bottom:-4px;width:12px;height:12px;' +
      'transform:translateX(-50%);background:#1b110a;border-radius:50%;"></div>';
    stage.appendChild(bell);

    // Zones (top zone = order[0], bottom zone = order[num-1])
    const palette = ['#c83a1e', '#f1e6cb', '#d99a2b', '#2c5d52', '#e35636', '#fbf4dd'];
    const zoneRefs = [];
    for (let i = 0; i < num; i++) {
      const c = palette[i % palette.length];
      const dark = c === '#c83a1e' || c === '#2c5d52' || c === '#e35636';
      const textColor = dark ? '#fbf4dd' : '#1b110a';
      const zone = document.createElement('div');
      zone.style.cssText =
        'position:absolute;left:4px;right:4px;' +
        'top:' + (i * zoneH + 3) + 'px;height:' + (zoneH - 2) + 'px;' +
        'background:' + c + ';color:' + textColor + ';' +
        'border-bottom:1px solid rgba(0,0,0,0.25);' +
        'display:flex;align-items:center;justify-content:space-between;padding:0 8px;' +
        'font-family:"Rye","Times New Roman",serif;overflow:hidden;';

      const rank = document.createElement('span');
      rank.textContent = String(num - i);
      rank.style.cssText = 'font-size:' + Math.round(Math.min(13, Math.max(10, zoneH * 0.32))) + 'px;font-weight:700;letter-spacing:1px;';
      zone.appendChild(rank);

      const name = document.createElement('span');
      name.textContent = String(order[i].name).slice(0, 12);
      name.style.cssText =
        'font-size:' + Math.round(Math.min(14, Math.max(10, zoneH * 0.36))) + 'px;' +
        'font-weight:700;letter-spacing:0.5px;';
      zone.appendChild(name);

      const av = document.createElement('img');
      av.src = order[i].avatarUrl;
      const avSize = Math.min(26, zoneH - 6);
      av.style.cssText = 'width:' + avSize + 'px;height:' + avSize + 'px;border-radius:50%;border:2px solid #1b110a;';
      zone.appendChild(av);

      tower.appendChild(zone);
      zoneRefs.push(zone);
    }

    // Pad / lever at the bottom of the tower
    const pad = document.createElement('div');
    pad.style.cssText =
      'position:absolute;left:' + (towerLeft - 12) + 'px;' +
      'top:' + (towerTop + usedTowerH + 8) + 'px;' +
      'width:' + (towerW + 24) + 'px;height:' + padH + 'px;border-radius:4px;' +
      'background:linear-gradient(180deg, #d99a2b, #6b3a18);' +
      'border:2px solid #1b110a;box-shadow:0 4px 10px rgba(0,0,0,0.5);' +
      'transition:transform 0.12s ease;';
    stage.appendChild(pad);

    // Puck sits beside the tower on the left, starting at the bottom
    const puckLeft = towerLeft - puckSize - 10;
    const puckStartTop = towerTop + usedTowerH - puckSize - 2;
    const puck = document.createElement('div');
    puck.style.cssText =
      'position:absolute;left:' + puckLeft + 'px;top:' + puckStartTop + 'px;' +
      'width:' + puckSize + 'px;height:' + puckSize + 'px;border-radius:6px;' +
      'background:radial-gradient(circle at 35% 30%, #ff7b3c, #c83a1e 70%, #6b1a08);' +
      'border:2px solid #1b110a;box-shadow:0 6px 12px rgba(0,0,0,0.55);z-index:6;';
    stage.appendChild(puck);

    // Mallet: enters from upper-right, pivots around the right-hand handle end,
    // swings down so the head lands on the pad.
    const malletLen = 140;
    const malletRestTop = towerTop + usedTowerH - 4;
    const malletRestLeft = stageW - malletLen + 8;
    const mallet = document.createElement('div');
    mallet.style.cssText =
      'position:absolute;left:' + malletRestLeft + 'px;top:' + malletRestTop + 'px;' +
      'width:' + malletLen + 'px;height:46px;transform-origin:100% 50%;' +
      'transform:translate(60px,-220px) rotate(-70deg);z-index:7;';

    const malletHandle = document.createElement('div');
    malletHandle.style.cssText =
      'position:absolute;left:34px;top:16px;width:' + (malletLen - 34) + 'px;height:14px;' +
      'background:linear-gradient(180deg, #6b3a18, #2a1606);' +
      'border:2px solid #1b110a;border-radius:3px;';
    mallet.appendChild(malletHandle);

    const malletHead = document.createElement('div');
    malletHead.style.cssText =
      'position:absolute;left:0;top:2px;width:44px;height:42px;' +
      'background:radial-gradient(circle at 35% 30%, #b87c1a, #6b3a18 70%, #2a1606);' +
      'border:2px solid #1b110a;border-radius:6px;' +
      'box-shadow:inset 0 -6px 10px rgba(0,0,0,0.4);';
    mallet.appendChild(malletHead);

    stage.appendChild(mallet);

    document.body.appendChild(overlay);

    // Phase budget
    const swingDelay = Math.max(280, Math.round(totalMs * 0.12));
    const swingDur = 380;
    const impactPause = 160;
    const revealHold = 500;
    const flightDur = Math.max(700, totalMs - swingDelay - swingDur - impactPause - revealHold);

    // Phase 1: mallet swings in and down onto the pad
    setTimeout(() => {
      mallet.style.transition = 'transform ' + swingDur + 'ms cubic-bezier(0.55, 0, 0.3, 1.5)';
      mallet.style.transform = 'translate(0,0) rotate(0deg)';
    }, swingDelay);

    // Phase 2: impact flash + puck launch
    const launchAt = swingDelay + swingDur + impactPause;
    setTimeout(() => {
      pad.style.transform = 'scaleY(0.5) translateY(8px)';
      setTimeout(() => {
        pad.style.transition = 'transform 0.25s ease';
        pad.style.transform = '';
      }, 140);

      const flash = document.createElement('div');
      flash.style.cssText =
        'position:absolute;left:' + (towerLeft - 32) + 'px;' +
        'top:' + (towerTop + usedTowerH - 6) + 'px;' +
        'width:' + (towerW + 64) + 'px;height:54px;border-radius:50%;' +
        'background:radial-gradient(ellipse at center, rgba(255,232,150,0.95), rgba(255,232,150,0));' +
        'pointer-events:none;animation:hsFlash 0.4s ease-out forwards;';
      stage.appendChild(flash);
      setTimeout(() => flash.remove(), 420);

      // Puck flight: overshoot the winning zone slightly, then descend to settle.
      const targetTop = towerTop + targetIndex * zoneH + 3 + (zoneH - puckSize) / 2;
      const overshootTop = Math.max(
        towerTop + 4,
        targetTop - Math.min(zoneH * 0.8, 36)
      );
      const useOvershoot = targetIndex > 0 && overshootTop < targetTop - 6;

      if (useOvershoot) {
        const upDur = Math.round(flightDur * 0.72);
        const downDur = flightDur - upDur;
        puck.style.transition = 'top ' + upDur + 'ms cubic-bezier(0.18, 0.92, 0.4, 1)';
        puck.style.top = overshootTop + 'px';
        setTimeout(() => {
          puck.style.transition = 'top ' + downDur + 'ms cubic-bezier(0.45, 0, 0.55, 1)';
          puck.style.top = targetTop + 'px';
        }, upDur);
      } else {
        puck.style.transition = 'top ' + flightDur + 'ms cubic-bezier(0.18, 0.92, 0.4, 1.04)';
        puck.style.top = targetTop + 'px';
      }

      // If the winner is the top zone, ring the bell at the end of flight.
      if (targetIndex === 0) {
        setTimeout(() => {
          let dings = 0;
          const ding = setInterval(() => {
            bell.style.transition = 'transform 0.09s ease';
            bell.style.transform = (dings % 2 === 0) ? 'rotate(11deg)' : 'rotate(-11deg)';
            dings++;
            if (dings >= 7) {
              clearInterval(ding);
              bell.style.transform = 'rotate(0deg)';
            }
          }, 95);
        }, Math.max(0, flightDur - 80));
      }

      // Glow the winning zone + puck after the flight finishes.
      setTimeout(() => {
        const zone = zoneRefs[targetIndex];
        zone.style.transition = 'box-shadow 0.35s ease, transform 0.35s ease';
        zone.style.boxShadow = '0 0 24px rgba(255,232,150,0.95), inset 0 0 12px rgba(255,255,255,0.6)';
        zone.style.transform = 'scale(1.05)';
        puck.style.transition = 'box-shadow 0.4s ease';
        puck.style.boxShadow = '0 0 18px rgba(255,232,150,0.8), 0 6px 12px rgba(0,0,0,0.55)';
      }, flightDur);
    }, launchAt);

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes hsFlash { 0% { opacity: 1; transform: scale(0.6); } 100% { opacity: 0; transform: scale(1.6); } }';
    document.head.appendChild(styleEl);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, totalMs + 200);
  }

  /** "144p to 4K" / AI Upscale picker. Names cycle inside a CRT-styled monitor at
   *  blurry, desaturated "144p" quality with scan lines. After the cycle slows on
   *  the winner, an "ENHANCING…" progress bar fills, the badge flips from 144p to
   *  4K UHD, the filter clears, and the winner snaps into crisp high-def.
   *  Riffing on the April 2026 TikTok upscale trend (@milei_zaza, ~82M views). */
