import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'upscale';
export const label = 'AI Upscale (144p\\u21924K)';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const totalMs = CONFIG.spinDuration;

    // Phase budget — proportional so very short spins still work
    const cycleMs = Math.max(450, Math.round(totalMs * 0.50));
    const slowMs = Math.max(200, Math.round(totalMs * 0.18));
    const enhanceMs = Math.max(450, Math.round(totalMs * 0.22));
    const holdMs = Math.max(250, totalMs - cycleMs - slowMs - enhanceMs);

    const headline = document.createElement('div');
    headline.textContent = 'AI Upscale';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:22px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.55);text-transform:uppercase;';
    overlay.appendChild(headline);

    // CRT monitor
    const screenW = 440;
    const screenH = 280;
    const screen = document.createElement('div');
    screen.style.cssText =
      'position:relative;width:' + screenW + 'px;height:' + screenH + 'px;' +
      'background:#0a0a14;border:6px solid #1b110a;border-radius:14px;overflow:hidden;' +
      'box-shadow:inset 0 0 80px rgba(0,0,0,0.85), 0 22px 50px rgba(0,0,0,0.7);';
    overlay.appendChild(screen);

    // Color plate — dim/desaturated for 144p, vibrant for 4K
    const plate = document.createElement('div');
    plate.style.cssText =
      'position:absolute;inset:0;' +
      'background:radial-gradient(ellipse at center, #1a1a26 0%, #08080f 80%);' +
      'transition:background 0.55s ease;';
    screen.appendChild(plate);

    // The cycling name display
    const nameEl = document.createElement('div');
    nameEl.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
      'font-family:"Rye","Times New Roman",serif;font-size:68px;font-weight:900;' +
      'color:#fbf4dd;text-shadow:0 0 18px rgba(255,235,160,0.35);' +
      'letter-spacing:2px;text-align:center;padding:0 24px;line-height:1;' +
      'filter:blur(8px) contrast(1.8) saturate(0.35) brightness(0.7);' +
      'transition:filter 0.55s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.55s ease;';
    nameEl.textContent = 'LOADING';
    screen.appendChild(nameEl);

    // Scan lines (CRT)
    const scanlines = document.createElement('div');
    scanlines.style.cssText =
      'position:absolute;inset:0;pointer-events:none;' +
      'background:repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px);' +
      'mix-blend-mode:multiply;transition:opacity 0.55s ease;';
    screen.appendChild(scanlines);

    // RGB chromatic-aberration ghost (subtle red/cyan offset, hidden on 4K)
    const aberration = document.createElement('div');
    aberration.style.cssText =
      'position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:0.55;' +
      'background:radial-gradient(circle at 48% 50%, rgba(0,200,220,0.16), transparent 60%),' +
      'radial-gradient(circle at 52% 50%, rgba(220,40,60,0.16), transparent 60%);' +
      'transition:opacity 0.5s ease;';
    screen.appendChild(aberration);

    // Resolution badge
    const badge = document.createElement('div');
    badge.textContent = '144p';
    badge.style.cssText =
      'position:absolute;top:12px;left:12px;padding:5px 11px;border-radius:4px;' +
      'background:#c83a1e;color:#fbf4dd;' +
      'font-family:"JetBrains Mono","Menlo",monospace;font-size:12px;letter-spacing:1.5px;font-weight:700;' +
      'box-shadow:0 3px 0 #1b110a;z-index:5;transition:all 0.4s ease;';
    screen.appendChild(badge);

    // AI pulsing indicator
    const aiBadge = document.createElement('div');
    aiBadge.textContent = '\u2727 AI';
    aiBadge.style.cssText =
      'position:absolute;top:12px;right:12px;padding:5px 11px;border-radius:4px;' +
      'background:rgba(255,255,255,0.08);color:#fbf4dd;' +
      'border:1px solid rgba(255,255,255,0.25);' +
      'font-family:"JetBrains Mono","Menlo",monospace;font-size:12px;letter-spacing:2px;font-weight:700;' +
      'z-index:5;animation:upscalePulse 1.2s ease-in-out infinite;';
    screen.appendChild(aiBadge);

    // Progress bar at the bottom
    const progressLabel = document.createElement('div');
    progressLabel.textContent = 'BUFFERING\u2026';
    progressLabel.style.cssText =
      'position:absolute;bottom:26px;left:14px;color:rgba(251,244,221,0.8);' +
      'font-family:"JetBrains Mono","Menlo",monospace;font-size:10px;letter-spacing:2px;font-weight:700;z-index:5;';
    screen.appendChild(progressLabel);

    const progressTrack = document.createElement('div');
    progressTrack.style.cssText =
      'position:absolute;bottom:12px;left:12px;right:12px;height:5px;' +
      'background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;z-index:5;';
    const progressBar = document.createElement('div');
    progressBar.style.cssText =
      'height:100%;width:8%;' +
      'background:linear-gradient(90deg, #d99a2b, #fbf4dd);' +
      'box-shadow:0 0 12px rgba(255,235,160,0.7);' +
      'transition:width 0.5s ease;';
    progressTrack.appendChild(progressBar);
    screen.appendChild(progressTrack);

    // Inject CSS keyframes
    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes upscalePulse { 0%,100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }';
    document.head.appendChild(styleEl);

    document.body.appendChild(overlay);

    // Phase 1: fast blurry cycle. Interval handles live in this scope so Phase 3 can
    // clear them itself — avoiding a race where a stale tick overwrites the winner.
    const shuffled = order.slice().sort(() => Math.random() - 0.5);
    let idx = 0;
    let fastInterval = setInterval(() => {
      nameEl.textContent = String(shuffled[idx % shuffled.length].name).toUpperCase().slice(0, 12);
      idx++;
    }, 75);
    let slowInterval = null;

    // Mid-cycle: progress creeps to ~45%
    setTimeout(() => { progressBar.style.width = '45%'; }, Math.min(300, cycleMs * 0.4));

    // Phase 2: stop the fast cycle, start the slow one. No separate "stop slow"
    // timer — Phase 3 will clear it explicitly.
    setTimeout(() => {
      if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
      slowInterval = setInterval(() => {
        nameEl.textContent = String(shuffled[idx % shuffled.length].name).toUpperCase().slice(0, 12);
        idx++;
      }, 180);
      progressBar.style.width = '72%';
      progressLabel.textContent = 'ANALYZING\u2026';
    }, cycleMs);

    // Phase 3: ENHANCE. Clear both intervals before writing the winner so no stale
    // tick can clobber it.
    setTimeout(() => {
      if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
      if (slowInterval) { clearInterval(slowInterval); slowInterval = null; }
      nameEl.textContent = String(order[targetIndex].name).toUpperCase().slice(0, 12);
      progressLabel.textContent = 'ENHANCING\u2026';
      progressBar.style.width = '100%';

      // Halfway through the enhance: the actual upscale lands
      setTimeout(() => {
        nameEl.style.filter = 'blur(0) contrast(1.05) saturate(1.3) brightness(1.06)';
        nameEl.style.transform = 'scale(1.04)';
        plate.style.background = 'radial-gradient(ellipse at center, #2a3158 0%, #0a1230 80%)';
        scanlines.style.opacity = '0.18';
        aberration.style.opacity = '0';
        // Flip badge to 4K UHD with a pop + green glow
        badge.textContent = '4K UHD';
        badge.style.background = '#0cc846';
        badge.style.color = '#0a0a14';
        badge.style.transform = 'scale(1.22)';
        badge.style.boxShadow = '0 3px 0 #1b110a, 0 0 22px rgba(12,200,70,0.75)';
        progressLabel.textContent = '\u2713 DONE';
        progressLabel.style.color = '#0cc846';
      }, Math.round(enhanceMs * 0.5));

      // Settle the badge back
      setTimeout(() => {
        badge.style.transform = 'scale(1)';
      }, Math.round(enhanceMs * 0.85));
    }, cycleMs + slowMs);

    // Cleanup
    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, cycleMs + slowMs + enhanceMs + holdMs);
  }

  /** AI Action Figure picker. Riffs on the April 2026 ChatGPT-image LinkedIn/TikTok
   *  trend ("imagine me as a boxed action figure"). A retro 90s toy blister pack
   *  appears, the dome cycles through candidate "figures" (avatar + name card),
   *  then a gold LIMITED EDITION stamp slams onto the winner. */
