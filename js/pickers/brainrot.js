import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'brainrot';
export const label = 'Italian Brain Rot';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const totalMs = CONFIG.spinDuration;

    const cycleMs = Math.max(700, Math.round(totalMs * 0.50));
    const slowMs = Math.max(300, Math.round(totalMs * 0.18));
    const slamMs = Math.max(400, Math.round(totalMs * 0.18));
    const holdMs = Math.max(250, totalMs - cycleMs - slowMs - slamMs);

    const headline = document.createElement('div');
    headline.textContent = 'Brain Rot';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:22px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.55);text-transform:uppercase;';
    overlay.appendChild(headline);

    const stageW = 500;
    const stageH = 340;
    const stage = document.createElement('div');
    stage.style.cssText =
      'position:relative;width:' + stageW + 'px;height:' + stageH + 'px;overflow:hidden;' +
      'background:linear-gradient(135deg, #0cc846 0%, #e81dbb 50%, #d99a2b 100%);' +
      'border:5px solid #1b110a;border-radius:10px;' +
      'box-shadow:0 24px 50px rgba(0,0,0,0.7);';
    overlay.appendChild(stage);

    // Scan-line / glitch overlay
    const glitch = document.createElement('div');
    glitch.style.cssText =
      'position:absolute;inset:0;mix-blend-mode:overlay;pointer-events:none;' +
      'background:repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 5px);' +
      'animation:brAnimBg 0.4s steps(3) infinite;';
    stage.appendChild(glitch);

    // Floating emoji creatures
    const emojis = [
      '\uD83D\uDC0A', '\uD83C\uDF5D', '\uD83C\uDF55', '\uD83E\uDD16',
      '\uD83E\uDD8D', '\uD83C\uDF54', '\uD83D\uDC80', '\u2615',
      '\uD83C\uDF4C', '\uD83E\uDDC9',
    ];
    for (let i = 0; i < 12; i++) {
      const e = document.createElement('div');
      const left = Math.floor(Math.random() * 92);
      const top = Math.floor(Math.random() * 75);
      const delay = -(Math.random() * 4).toFixed(2);
      const size = 30 + Math.floor(Math.random() * 30);
      const dur = (1.4 + Math.random() * 1.6).toFixed(2);
      e.textContent = emojis[i % emojis.length];
      e.style.cssText =
        'position:absolute;left:' + left + '%;top:' + top + '%;font-size:' + size + 'px;' +
        'animation:brBounce ' + dur + 's ease-in-out infinite alternate;animation-delay:' + delay + 's;' +
        'pointer-events:none;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5));';
      stage.appendChild(e);
    }

    // Center name + gibberish
    const center = document.createElement('div');
    center.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%, -50%);text-align:center;z-index:4;';
    stage.appendChild(center);

    const bigName = document.createElement('div');
    bigName.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:54px;font-weight:900;' +
      'color:#fbf4dd;text-shadow:6px 6px 0 #1b110a, -2px -2px 0 #c83a1e, 2px -2px 0 #0cc846;' +
      'letter-spacing:1px;line-height:1;padding:8px 22px;background:rgba(0,0,0,0.22);' +
      'border:3px dashed #fbf4dd;border-radius:8px;transition:transform 0.35s ease;';
    bigName.textContent = '???';
    center.appendChild(bigName);

    const gibberishLine = document.createElement('div');
    gibberishLine.style.cssText =
      'margin-top:10px;font-family:"Rye","Times New Roman",serif;font-size:22px;' +
      'color:#fbf4dd;font-weight:700;letter-spacing:2px;text-shadow:0 3px 0 rgba(0,0,0,0.6);';
    gibberishLine.textContent = '\u2014';
    center.appendChild(gibberishLine);

    // Bottom marquee
    const marqueeWrap = document.createElement('div');
    marqueeWrap.style.cssText =
      'position:absolute;left:0;right:0;bottom:0;height:32px;' +
      'background:rgba(0,0,0,0.55);border-top:2px solid #1b110a;overflow:hidden;display:flex;align-items:center;';
    const marqueePhrase =
      'BOMBARDIRO CROCODILO \u2666 TRALALERO TRALALA \u2666 LIRILI LARILA \u2666 ' +
      'BRR BRR PATAPIM \u2666 TUNG TUNG TUNG SAHUR \u2666 BANANITA DOLPHINITA \u2666 ' +
      'CAPPUCCINO ASSASSINO \u2666 BOMBOMBINI GUSINI \u2666 ';
    const marqueeText = document.createElement('div');
    marqueeText.textContent = marqueePhrase + marqueePhrase;
    marqueeText.style.cssText =
      'white-space:nowrap;color:#fbf4dd;font-family:"JetBrains Mono","Menlo",monospace;' +
      'font-size:12px;font-weight:700;letter-spacing:2px;' +
      'animation:brMarquee 8s linear infinite;';
    marqueeWrap.appendChild(marqueeText);
    stage.appendChild(marqueeWrap);

    // Gold "VINCITORE!" banner
    const banner = document.createElement('div');
    banner.style.cssText =
      'position:absolute;left:50%;top:18px;transform:translateX(-50%) rotate(-3deg) scale(0.3);' +
      'padding:6px 24px;background:#d99a2b;border:3px solid #1b110a;border-radius:6px;' +
      'font-family:"Rye","Times New Roman",serif;font-size:20px;font-weight:900;color:#1b110a;' +
      'letter-spacing:3px;text-transform:uppercase;' +
      'box-shadow:0 4px 0 #1b110a, 0 0 22px rgba(255,232,150,0.85);' +
      'opacity:0;transition:opacity 0.18s ease, transform 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);z-index:6;';
    banner.textContent = 'Vincitore!';
    stage.appendChild(banner);

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes brBounce { 0% { transform: translate(0,0) rotate(0deg); } 100% { transform: translate(22px,-32px) rotate(15deg); } }' +
      '@keyframes brAnimBg { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-4px,2px); } }' +
      '@keyframes brMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }' +
      '@keyframes brShake { 0%,100% { transform: translate(0,0) rotate(-1deg); } 25% { transform: translate(-2px,1px) rotate(1deg); } 50% { transform: translate(2px,-1px) rotate(-1deg); } 75% { transform: translate(-1px,-1px) rotate(0.5deg); } }';
    document.head.appendChild(styleEl);

    document.body.appendChild(overlay);

    const SUFFIXES = ['CROCODILO!', 'TRALALA!', 'CAPPUCCINO!', 'ASSASSINO!', 'PATAPIM!', 'BANANITA!', 'BOMBARDIRO!', 'GUSINI!'];
    const COLORS = ['#fbf4dd', '#d99a2b', '#0cc846', '#c83a1e', '#e81dbb', '#09c5a7', '#ffffff'];

    const shuffled = order.slice().sort(() => Math.random() - 0.5);
    let idx = 0;
    let fastInterval = null;
    let slowInterval = null;

    bigName.style.animation = 'brShake 0.16s linear infinite';

    fastInterval = setInterval(() => {
      const pick = shuffled[idx % shuffled.length];
      bigName.textContent = String(pick.name).toUpperCase().slice(0, 10);
      bigName.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      bigName.style.transform =
        'rotate(' + (Math.random() * 8 - 4).toFixed(1) + 'deg) ' +
        'scale(' + (0.95 + Math.random() * 0.18).toFixed(2) + ')';
      gibberishLine.textContent = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
      idx++;
    }, 80);

    setTimeout(() => {
      if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
      slowInterval = setInterval(() => {
        const pick = shuffled[idx % shuffled.length];
        bigName.textContent = String(pick.name).toUpperCase().slice(0, 10);
        bigName.style.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        bigName.style.transform = 'rotate(' + (Math.random() * 6 - 3).toFixed(1) + 'deg) scale(1)';
        gibberishLine.textContent = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        idx++;
      }, 180);
    }, cycleMs);

    setTimeout(() => {
      if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
      if (slowInterval) { clearInterval(slowInterval); slowInterval = null; }
      bigName.style.animation = 'none';
      bigName.style.color = '#fbf4dd';
      bigName.style.transform = 'rotate(0deg) scale(1.1)';
      bigName.style.transition = 'transform 0.4s cubic-bezier(0.3, 1.5, 0.5, 1), color 0.3s ease';
      bigName.textContent = String(order[targetIndex].name).toUpperCase().slice(0, 10);
      gibberishLine.textContent = 'IL VINCITORE \u00C8\u2026';

      setTimeout(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateX(-50%) rotate(-3deg) scale(1.12)';
        setTimeout(() => {
          banner.style.transform = 'translateX(-50%) rotate(-3deg) scale(1)';
        }, 240);
      }, 60);
    }, cycleMs + slowMs);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, cycleMs + slowMs + slamMs + holdMs);
  }

  /** Odyssey picker — Penelope's Challenge of the Bow (Odyssey XXI). Suitors
   *  take turns trying to string Odysseus's great bow and fail. The winner
   *  strings it easily and sends an arrow through twelve axe-head sockets. */
