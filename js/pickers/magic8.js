import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'magic8';
export const label = 'Magic 8-Ball';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const totalMs = CONFIG.spinDuration;

    // Phase budget: intro lift, then shake, then name cycle, then reveal hold.
    const liftMs = Math.max(280, Math.round(totalMs * 0.16));
    const shakeMs = Math.max(700, Math.round(totalMs * 0.42));
    const cycleMs = Math.max(550, Math.round(totalMs * 0.27));
    const revealMs = Math.max(400, totalMs - liftMs - shakeMs - cycleMs);

    const caption = document.createElement('div');
    caption.textContent = 'Concentrate \u2014 and ask\u2026';
    caption.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:22px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.55), 0 0 18px rgba(170,210,255,0.25);' +
      'text-transform:uppercase;margin-bottom:8px;opacity:0;transition:opacity 0.4s ease;';
    overlay.appendChild(caption);

    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;width:360px;height:360px;';
    overlay.appendChild(stage);

    // The ball
    const ballSize = 320;
    const ball = document.createElement('div');
    ball.style.cssText =
      'position:absolute;left:50%;top:50%;width:' + ballSize + 'px;height:' + ballSize + 'px;' +
      'border-radius:50%;transform:translate(-50%,-50%);' +
      'background:radial-gradient(circle at 32% 26%, #7a7a7a 0%, #2a2a2a 38%, #0a0a0a 78%, #000 100%);' +
      'box-shadow:inset -22px -36px 70px rgba(0,0,0,0.85), 0 28px 70px rgba(0,0,0,0.85), 0 8px 22px rgba(0,0,0,0.7);' +
      'transition:box-shadow 0.5s ease;';
    stage.appendChild(ball);

    // Specular highlight (the classic upper-left shine)
    const highlight = document.createElement('div');
    highlight.style.cssText =
      'position:absolute;top:12%;left:16%;width:96px;height:62px;border-radius:50%;' +
      'background:radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%);' +
      'filter:blur(3px);pointer-events:none;';
    ball.appendChild(highlight);

    // The white "viewing port" disk — shows the "8" first, then the answer window
    const portSize = 174;
    const port = document.createElement('div');
    port.style.cssText =
      'position:absolute;left:50%;top:50%;width:' + portSize + 'px;height:' + portSize + 'px;' +
      'border-radius:50%;transform:translate(-50%,-50%);background:#f1ead8;' +
      'box-shadow:inset 0 0 22px rgba(0,0,0,0.55), 0 0 0 6px #1b110a, 0 0 0 8px rgba(255,255,255,0.05);' +
      'overflow:hidden;display:flex;align-items:center;justify-content:center;';
    ball.appendChild(port);

    const eight = document.createElement('div');
    eight.textContent = '8';
    eight.style.cssText =
      'font-family:"Times New Roman",Georgia,serif;font-weight:900;font-size:128px;line-height:1;' +
      'color:#1b110a;transition:opacity 0.35s ease, transform 0.35s ease;';
    port.appendChild(eight);

    // Triangle window overlay — hidden until shake completes
    const window_ = document.createElement('div');
    window_.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'background:radial-gradient(circle at center, #1f3f8a 0%, #0a1a45 65%, #03081c 100%);' +
      'opacity:0;transition:opacity 0.45s ease;';
    const wedge = document.createElement('div');
    wedge.style.cssText =
      'position:absolute;inset:0;clip-path:polygon(50% 16%, 88% 80%, 12% 80%);' +
      'background:linear-gradient(180deg, rgba(80,130,230,0.45), rgba(0,0,0,0.15));' +
      'box-shadow:inset 0 0 24px rgba(170,210,255,0.4);';
    window_.appendChild(wedge);
    const answer = document.createElement('div');
    answer.style.cssText =
      'position:relative;z-index:2;color:#e2ecff;text-shadow:0 0 14px rgba(170,210,255,0.9);' +
      'font-family:"Rye","Times New Roman",serif;font-size:20px;letter-spacing:1px;' +
      'text-align:center;padding:0 14px;line-height:1.1;transform:translateY(10px);';
    window_.appendChild(answer);
    port.appendChild(window_);

    document.body.appendChild(overlay);

    // Fade in caption right away
    requestAnimationFrame(() => { caption.style.opacity = '1'; });

    // Lift the ball gently as we wait for the shake
    ball.style.transition = 'transform ' + liftMs + 'ms ease-out';
    requestAnimationFrame(() => {
      ball.style.transform = 'translate(-50%, -56%)';
    });

    // Phase: shake
    setTimeout(() => {
      ball.style.transition = 'transform 80ms linear';
      let elapsed = 0;
      const tickMs = 70;
      const shake = setInterval(() => {
        const dx = (Math.random() * 16 - 8).toFixed(1);
        const dy = -50 + (Math.random() * 8 - 4);
        const rot = (Math.random() * 6 - 3).toFixed(1);
        ball.style.transform = 'translate(calc(-50% + ' + dx + 'px), ' + dy + '%) rotate(' + rot + 'deg)';
        elapsed += tickMs;
        if (elapsed >= shakeMs) {
          clearInterval(shake);
          ball.style.transition = 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)';
          ball.style.transform = 'translate(-50%, -50%) rotate(0deg)';
          // Swap to the answer window
          eight.style.opacity = '0';
          eight.style.transform = 'scale(0.6)';
          window_.style.opacity = '1';
        }
      }, tickMs);
    }, liftMs);

    // Phase: cycle names through the window. Interval handle lives in this scope so
    // the settle phase can clear it itself, avoiding a race where a stale tick
    // overwrites the winner.
    let cycleInterval = null;
    const cycleStart = liftMs + shakeMs + 260;
    setTimeout(() => {
      const stepMs = 75;
      let i = 0;
      const cycleOrder = order.slice().sort(() => Math.random() - 0.5);
      cycleInterval = setInterval(() => {
        const pick = cycleOrder[i % cycleOrder.length];
        answer.textContent = String(pick.name).toUpperCase().slice(0, 16);
        i++;
      }, stepMs);
    }, cycleStart);

    // Phase: settle on the winner + glow. Clear the cycle interval BEFORE writing
    // the winner so no in-flight tick can clobber it.
    const settleAt = cycleStart + cycleMs;
    setTimeout(() => {
      if (cycleInterval) { clearInterval(cycleInterval); cycleInterval = null; }
      answer.textContent = String(order[targetIndex].name).toUpperCase().slice(0, 16);
      answer.style.transition = 'transform 0.4s ease, text-shadow 0.4s ease, font-size 0.4s ease';
      answer.style.transform = 'translateY(10px) scale(1.12)';
      answer.style.textShadow = '0 0 22px rgba(190,220,255,1), 0 0 6px rgba(255,255,255,0.85)';
      ball.style.boxShadow =
        'inset -22px -36px 70px rgba(0,0,0,0.85), 0 0 70px rgba(140,190,255,0.65), ' +
        '0 28px 70px rgba(0,0,0,0.85), 0 8px 22px rgba(0,0,0,0.7)';
    }, settleAt);

    setTimeout(() => {
      overlay.remove();
      revealWinner(order, targetIndex);
    }, settleAt + revealMs);
  }

  /** High Striker / "Test Your Strength" carnival picker. A wooden tower with the
   *  names as ranked zones (top = highest rank, bottom = lowest). A mallet swings
   *  down onto a pad, the puck rockets up, overshoots, then settles on the winning
   *  zone. If the winner sits at the top zone, the bell rings. */
