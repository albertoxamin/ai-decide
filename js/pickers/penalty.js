import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'penalty';
export const label = 'Penalty shootout';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];
    const SHOT_MS = 900;
    const GOAL_MS = 1100;
    const holdMs = 500;
    const MAX_MISSES = 5;

    const headline = document.createElement('div');
    headline.textContent = 'Penalty Shootout';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:24px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.6);text-transform:uppercase;';
    overlay.appendChild(headline);

    const stageW = 640;
    const stageH = 390;
    const stage = document.createElement('div');
    stage.style.cssText =
      'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
      'background:linear-gradient(180deg,#1e5a28 0%,#2f8a3a 38%,#3aa34a 100%);' +
      'border:5px solid #1b110a;border-radius:10px;' +
      'box-shadow:0 24px 50px rgba(0,0,0,0.7);';
    overlay.appendChild(stage);

    // Pitch stripes
    for (let i = 0; i < 6; i++) {
      const stripe = document.createElement('div');
      stripe.style.cssText =
        'position:absolute;left:0;right:0;top:' + (i * 56) + 'px;height:28px;' +
        'background:rgba(255,255,255,' + (i % 2 ? '0.05' : '0.02') + ');pointer-events:none;';
      stage.appendChild(stripe);
    }

    const caption = document.createElement('div');
    caption.textContent = 'Sudden death from the spot';
    caption.style.cssText =
      'position:absolute;left:16px;right:16px;top:10px;text-align:center;z-index:8;' +
      'font-family:"Fraunces",Georgia,serif;font-size:13px;font-style:italic;color:#fbf4dd;' +
      'text-shadow:0 1px 3px #000;';
    stage.appendChild(caption);

    // Goal (right side)
    const goal = document.createElement('div');
    const goalLeft = 478;
    const goalTop = 70;
    const goalW = 132;
    const goalH = 168;
    goal.style.cssText =
      'position:absolute;left:' + goalLeft + 'px;top:' + goalTop + 'px;width:' + goalW + 'px;height:' + goalH + 'px;' +
      'border:6px solid #fbf4dd;border-right:6px solid #fbf4dd;border-radius:4px 10px 10px 4px;' +
      'background:repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 8px, transparent 8px 16px),' +
      'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0 8px, transparent 8px 16px);' +
      'box-shadow:inset -12px 0 20px rgba(0,0,0,0.25);z-index:3;';
    stage.appendChild(goal);

    const netPulse = document.createElement('div');
    netPulse.style.cssText =
      'position:absolute;inset:0;background:rgba(255,255,255,0);pointer-events:none;transition:background 0.2s;';
    goal.appendChild(netPulse);

    // Keeper
    const keeper = document.createElement('div');
    keeper.style.cssText =
      'position:absolute;left:' + (goalLeft + 38) + 'px;top:' + (goalTop + 54) + 'px;width:54px;' +
      'display:flex;flex-direction:column;align-items:center;gap:2px;z-index:5;' +
      'transition:top 0.28s cubic-bezier(0.2, 0.8, 0.3, 1), left 0.28s cubic-bezier(0.2, 0.8, 0.3, 1);';
    const keeperBody = document.createElement('div');
    keeperBody.style.cssText =
      'width:40px;height:48px;border-radius:8px 8px 4px 4px;background:linear-gradient(180deg,#f4f4f4,#c8c8c8);' +
      'border:2px solid #1b110a;';
    const keeperHead = document.createElement('div');
    keeperHead.style.cssText =
      'width:26px;height:26px;border-radius:50%;background:#f1c27d;border:2px solid #1b110a;margin-top:-18px;';
    keeper.appendChild(keeperHead);
    keeper.appendChild(keeperBody);
    const gloves = document.createElement('div');
    gloves.textContent = 'SAVE';
    gloves.style.cssText =
      'font-size:8px;font-weight:800;color:#fff;text-shadow:0 1px 2px #000;letter-spacing:1px;opacity:0;transition:opacity 0.2s;';
    keeper.appendChild(gloves);
    stage.appendChild(keeper);
    const keeperRestTop = goalTop + 54;
    const keeperRestLeft = goalLeft + 38;

    // Ball
    const ball = document.createElement('div');
    const ballStartLeft = 118;
    const ballStartTop = 210;
    ball.style.cssText =
      'position:absolute;left:' + ballStartLeft + 'px;top:' + ballStartTop + 'px;width:22px;height:22px;z-index:6;' +
      'border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#d8d8d8 40%,#222 42%,#fff 70%);' +
      'border:2px solid #1b110a;box-shadow:0 3px 6px rgba(0,0,0,0.4);' +
      'transition:left 0.55s cubic-bezier(0.2, 0.7, 0.4, 1), top 0.55s cubic-bezier(0.2, 0.7, 0.4, 1);';
    stage.appendChild(ball);

    // Penalty spot
    const spotMark = document.createElement('div');
    spotMark.style.cssText =
      'position:absolute;left:124px;top:236px;width:10px;height:10px;border-radius:50%;background:#fbf4dd;';
    stage.appendChild(spotMark);

    // Kicker
    const kickerWrap = document.createElement('div');
    kickerWrap.style.cssText =
      'position:absolute;left:36px;top:168px;width:72px;' +
      'display:flex;flex-direction:column;align-items:center;gap:4px;z-index:6;' +
      'transition:transform 0.25s ease;';
    const kickerImg = document.createElement('img');
    kickerImg.src = order[0].avatarUrl;
    kickerImg.style.cssText =
      'width:52px;height:52px;border-radius:50%;object-fit:cover;border:3px solid #fbf4dd;';
    const kickerName = document.createElement('div');
    kickerName.textContent = String(order[0].name).slice(0, 10);
    kickerName.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:11px;color:#fbf4dd;text-shadow:0 1px 2px #000;';
    kickerWrap.appendChild(kickerImg);
    kickerWrap.appendChild(kickerName);
    stage.appendChild(kickerWrap);

    // Roster
    const roster = document.createElement('div');
    roster.style.cssText =
      'position:absolute;left:10px;right:10px;bottom:8px;height:56px;' +
      'display:flex;align-items:center;justify-content:center;gap:6px;overflow:hidden;z-index:7;';
    stage.appendChild(roster);
    const rosterEls = order.map(function (person, i) {
      const chip = document.createElement('div');
      chip.style.cssText =
        'display:flex;flex-direction:column;align-items:center;gap:2px;transition:filter 0.35s, opacity 0.35s, transform 0.35s;';
      const img = document.createElement('img');
      img.src = person.avatarUrl;
      img.style.cssText = 'width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid #fbf4dd;';
      const nm = document.createElement('span');
      nm.textContent = String(person.name).slice(0, 7);
      nm.style.cssText = 'font-size:8px;color:#fbf4dd;font-weight:600;max-width:36px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      chip.appendChild(img);
      chip.appendChild(nm);
      roster.appendChild(chip);
      return { chip: chip, img: img, index: i };
    });

    const goalBanner = document.createElement('div');
    goalBanner.textContent = 'GOAL';
    goalBanner.style.cssText =
      'position:absolute;left:50%;top:48px;transform:translateX(-50%) scale(0.4);opacity:0;' +
      'font-family:"Rye","Times New Roman",serif;font-size:48px;letter-spacing:6px;color:#fff;' +
      'text-shadow:0 3px 0 #1b110a, 0 0 22px rgba(255,220,80,0.9);z-index:9;' +
      'transition:opacity 0.2s, transform 0.45s cubic-bezier(0.3,1.6,0.5,1);';
    stage.appendChild(goalBanner);

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes penKick { 0% { transform: translateX(0); } 40% { transform: translateX(10px) rotate(8deg); } 100% { transform: translateX(0); } }' +
      '@keyframes penNet { 0% { transform: scaleX(1); } 40% { transform: scaleX(1.08) scaleY(1.04); } 100% { transform: scaleX(1); } }';
    document.head.appendChild(styleEl);

    document.body.appendChild(overlay);

    const missIdx = order.map(function (_, i) { return i; }).filter(function (i) { return i !== targetIndex; });
    for (let i = missIdx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = missIdx[i];
      missIdx[i] = missIdx[j];
      missIdx[j] = tmp;
    }
    const misses = missIdx.slice(0, MAX_MISSES);
    misses.forEach(function (idx) {
      rosterEls[idx].chip.style.opacity = '1';
    });
    missIdx.slice(MAX_MISSES).forEach(function (idx) {
      rosterEls[idx].chip.style.opacity = '0.35';
      rosterEls[idx].chip.style.filter = 'grayscale(1)';
    });

    function setKicker(person) {
      kickerImg.src = person.avatarUrl;
      kickerName.textContent = String(person.name).slice(0, 10);
    }

    function resetBall() {
      ball.style.transition = 'none';
      ball.style.left = ballStartLeft + 'px';
      ball.style.top = ballStartTop + 'px';
      void ball.offsetWidth;
      ball.style.transition =
        'left 0.55s cubic-bezier(0.2, 0.7, 0.4, 1), top 0.55s cubic-bezier(0.2, 0.7, 0.4, 1)';
      keeper.style.left = keeperRestLeft + 'px';
      keeper.style.top = keeperRestTop + 'px';
      gloves.style.opacity = '0';
    }

    misses.forEach(function (idx, n) {
      setTimeout(function () {
        const person = order[idx];
        resetBall();
        setKicker(person);
        caption.textContent = person.name + ' steps up\u2026';
        kickerWrap.style.animation = 'none';
        void kickerWrap.offsetWidth;
        kickerWrap.style.animation = 'penKick 0.4s ease-out';
        rosterEls.forEach(function (r) {
          r.img.style.borderColor = r.index === idx ? '#ffcc00' : '#fbf4dd';
        });
        const diveUp = n % 2 === 0;
        setTimeout(function () {
          keeper.style.top = (diveUp ? goalTop + 18 : goalTop + 96) + 'px';
          keeper.style.left = (keeperRestLeft + (diveUp ? 18 : -8)) + 'px';
          ball.style.left = (goalLeft + 24) + 'px';
          ball.style.top = (diveUp ? goalTop + 36 : goalTop + 110) + 'px';
        }, 180);
        setTimeout(function () {
          gloves.style.opacity = '1';
          caption.textContent = 'SAVED';
          rosterEls[idx].chip.style.filter = 'grayscale(1)';
          rosterEls[idx].chip.style.opacity = '0.4';
        }, 620);
      }, n * SHOT_MS);
    });

    const scoreAt = misses.length * SHOT_MS;
    setTimeout(function () {
      resetBall();
      setKicker(winner);
      caption.textContent = winner.name + ' \u2014 the last kick';
      kickerWrap.style.animation = 'none';
      void kickerWrap.offsetWidth;
      kickerWrap.style.animation = 'penKick 0.4s ease-out';
      rosterEls.forEach(function (r) {
        r.img.style.borderColor = r.index === targetIndex ? '#ffcc00' : '#fbf4dd';
      });
      setTimeout(function () {
        keeper.style.top = (goalTop + 18) + 'px';
        keeper.style.left = (keeperRestLeft - 16) + 'px';
        ball.style.left = (goalLeft + 78) + 'px';
        ball.style.top = (goalTop + 108) + 'px';
      }, 200);
      setTimeout(function () {
        caption.textContent = 'GOAL';
        goalBanner.style.opacity = '1';
        goalBanner.style.transform = 'translateX(-50%) scale(1)';
        goal.style.animation = 'penNet 0.45s ease-out';
        netPulse.style.background = 'rgba(255,232,150,0.28)';
        kickerImg.style.borderColor = '#ffd86b';
        kickerImg.style.boxShadow = '0 0 18px rgba(255,232,150,0.9)';
        rosterEls[targetIndex].chip.style.transform = 'translateY(-8px) scale(1.12)';
        rosterEls[targetIndex].img.style.borderColor = '#ffd86b';
      }, 720);
    }, scoreAt);

    setTimeout(function () {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, scoreAt + GOAL_MS + holdMs);
  }

    /* ======================== End of picker animations ======================== */
