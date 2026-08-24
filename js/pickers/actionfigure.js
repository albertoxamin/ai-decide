import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'actionfigure';
export const label = 'AI Action Figure';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const totalMs = CONFIG.spinDuration;

    const introMs = Math.max(220, Math.round(totalMs * 0.10));
    const cycleMs = Math.max(700, Math.round(totalMs * 0.45));
    const slowMs = Math.max(280, Math.round(totalMs * 0.18));
    const stampMs = Math.max(400, Math.round(totalMs * 0.18));
    const holdMs = Math.max(250, totalMs - introMs - cycleMs - slowMs - stampMs);

    const headline = document.createElement('div');
    headline.textContent = 'AI Action Figure';
    headline.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:22px;letter-spacing:3px;' +
      'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.55);text-transform:uppercase;';
    overlay.appendChild(headline);

    const boxW = 360;
    const boxH = 480;
    const box = document.createElement('div');
    box.style.cssText =
      'position:relative;width:' + boxW + 'px;height:' + boxH + 'px;' +
      'background:linear-gradient(180deg, #e94b2a, #c83a1e);' +
      'border:4px solid #1b110a;border-radius:8px;overflow:hidden;' +
      'box-shadow:0 24px 50px rgba(0,0,0,0.7), inset 0 0 0 4px #fbf4dd, inset 0 0 0 6px #1b110a;' +
      'transform:scale(0.7);opacity:0;' +
      'transition:transform ' + introMs + 'ms cubic-bezier(0.4, 1.3, 0.6, 1), opacity ' + introMs + 'ms ease;';
    overlay.appendChild(box);

    // Top banner
    const banner = document.createElement('div');
    banner.style.cssText =
      'position:absolute;top:14px;left:14px;right:14px;height:48px;' +
      'background:#fbf4dd;border:3px solid #1b110a;border-radius:4px;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-family:"Rye","Times New Roman",serif;font-size:20px;font-weight:900;' +
      'color:#1b110a;letter-spacing:2px;text-transform:uppercase;' +
      'box-shadow:0 4px 0 #1b110a;';
    banner.textContent = '\u2605 AI Action Figure \u2605';
    box.appendChild(banner);

    // Yellow "AI POWERED!" corner burst
    const burst = document.createElement('div');
    burst.style.cssText =
      'position:absolute;top:78px;right:18px;width:84px;height:84px;' +
      'background:#d99a2b;color:#1b110a;border:3px solid #1b110a;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;' +
      'font-family:"Rye","Times New Roman",serif;font-size:14px;font-weight:900;' +
      'letter-spacing:1px;line-height:1.05;text-align:center;text-transform:uppercase;' +
      'transform:rotate(-12deg);box-shadow:0 4px 0 #1b110a;' +
      'animation:figBurst 1.6s ease-in-out infinite;z-index:3;';
    burst.innerHTML = 'AI<br>POWERED!';
    box.appendChild(burst);

    // Clear plastic dome
    const dome = document.createElement('div');
    dome.style.cssText =
      'position:absolute;left:32px;right:32px;top:78px;height:280px;' +
      'background:linear-gradient(135deg, rgba(214,228,255,0.45) 0%, rgba(180,210,250,0.25) 50%, rgba(120,180,250,0.45) 100%);' +
      'border:3px solid #1b110a;border-radius:40px 40px 12px 12px;overflow:hidden;' +
      'box-shadow:inset 14px 14px 28px rgba(255,255,255,0.7), inset -12px -12px 30px rgba(0,0,0,0.18), 0 6px 0 #1b110a;' +
      'display:flex;align-items:center;justify-content:center;';
    box.appendChild(dome);

    // Diagonal sheen on the dome
    const sheen = document.createElement('div');
    sheen.style.cssText =
      'position:absolute;left:-15%;top:-20%;width:55%;height:140%;' +
      'background:linear-gradient(115deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 50%);' +
      'pointer-events:none;';
    dome.appendChild(sheen);

    // Figure card (the "toy")
    const figureCard = document.createElement('div');
    figureCard.style.cssText =
      'position:relative;width:200px;background:#fbf4dd;border:3px solid #1b110a;border-radius:8px;' +
      'padding:14px;text-align:center;box-shadow:0 4px 0 #1b110a, 0 8px 16px rgba(0,0,0,0.35);' +
      'transition:box-shadow 0.5s ease;z-index:2;';
    dome.appendChild(figureCard);

    const avatarImg = document.createElement('img');
    avatarImg.src = generateAvatar(order[0].name);
    avatarImg.style.cssText =
      'width:80px;height:80px;border-radius:50%;border:3px solid #1b110a;display:block;margin:0 auto;';
    figureCard.appendChild(avatarImg);

    const nameLabel = document.createElement('div');
    nameLabel.style.cssText =
      'font-family:"Rye","Times New Roman",serif;font-size:18px;font-weight:900;color:#1b110a;' +
      'margin-top:10px;letter-spacing:1px;text-transform:uppercase;';
    nameLabel.textContent = '---';
    figureCard.appendChild(nameLabel);

    const seriesLabel = document.createElement('div');
    seriesLabel.style.cssText =
      'font-family:"JetBrains Mono","Menlo",monospace;font-size:10px;letter-spacing:2px;' +
      'color:#6b3a18;margin-top:6px;font-weight:700;';
    seriesLabel.textContent = 'SERIES 2026 \u2014 1 OF 1';
    figureCard.appendChild(seriesLabel);

    // "GENERATING…" status at the bottom of the dome
    const generating = document.createElement('div');
    generating.style.cssText =
      'position:absolute;left:0;right:0;bottom:8px;text-align:center;' +
      'color:#0a1230;font-family:"JetBrains Mono","Menlo",monospace;' +
      'font-size:11px;font-weight:700;letter-spacing:2px;' +
      'background:rgba(255,255,255,0.78);padding:3px 0;border-top:1px dashed #1b110a;' +
      'opacity:0;transition:opacity 0.3s ease;z-index:3;';
    generating.textContent = 'GENERATING\u2026';
    dome.appendChild(generating);

    // Accessories row
    const accessoriesWrap = document.createElement('div');
    accessoriesWrap.style.cssText =
      'position:absolute;left:32px;right:32px;top:374px;height:50px;' +
      'background:#fbf4dd;border:3px solid #1b110a;border-radius:6px;' +
      'display:flex;align-items:center;justify-content:space-around;padding:0 10px;' +
      'font-family:"Rye","Times New Roman",serif;color:#1b110a;font-weight:700;' +
      'font-size:11px;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 0 #1b110a;';
    ['\u2615 Coffee', '\uD83D\uDCBB Laptop', '\uD83D\uDD11 Keys', '\uD83D\uDE2C Anxiety'].forEach(t => {
      const item = document.createElement('span');
      item.textContent = t;
      accessoriesWrap.appendChild(item);
    });
    box.appendChild(accessoriesWrap);

    // Barcode + AI code at the bottom
    const barcode = document.createElement('div');
    barcode.style.cssText =
      'position:absolute;left:32px;bottom:18px;width:160px;height:28px;background:#fbf4dd;' +
      'border:2px solid #1b110a;border-radius:3px;padding:3px;box-sizing:border-box;';
    const ns = 'http://www.w3.org/2000/svg';
    const bcSvg = document.createElementNS(ns, 'svg');
    bcSvg.setAttribute('width', '154');
    bcSvg.setAttribute('height', '22');
    bcSvg.setAttribute('viewBox', '0 0 154 22');
    let bx = 0;
    while (bx < 154) {
      const w = (Math.random() < 0.5 ? 1 : 2) + (Math.random() < 0.3 ? 1 : 0);
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', String(bx));
      rect.setAttribute('y', '0');
      rect.setAttribute('width', String(w));
      rect.setAttribute('height', '22');
      rect.setAttribute('fill', '#1b110a');
      bcSvg.appendChild(rect);
      bx += w + (Math.random() < 0.5 ? 1 : 2);
    }
    barcode.appendChild(bcSvg);
    box.appendChild(barcode);

    const codeLabel = document.createElement('div');
    codeLabel.style.cssText =
      'position:absolute;right:32px;bottom:22px;font-family:"JetBrains Mono","Menlo",monospace;' +
      'font-size:11px;color:#fbf4dd;font-weight:700;letter-spacing:1px;';
    codeLabel.textContent = 'AI-' + Math.floor(Math.random() * 9000 + 1000);
    box.appendChild(codeLabel);

    // Gold "LIMITED EDITION" stamp, hidden until the lock phase
    const stamp = document.createElement('div');
    stamp.style.cssText =
      'position:absolute;left:50%;top:50%;' +
      'transform:translate(-50%, -50%) rotate(-18deg) scale(0.4);' +
      'padding:8px 24px;background:#d99a2b;border:3px solid #1b110a;border-radius:6px;' +
      'font-family:"Rye","Times New Roman",serif;font-size:18px;font-weight:900;color:#1b110a;' +
      'letter-spacing:2px;text-transform:uppercase;' +
      'box-shadow:0 5px 0 #1b110a, 0 0 24px rgba(255,232,150,0.85);' +
      'opacity:0;transition:opacity 0.18s ease, transform 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);z-index:6;';
    stamp.textContent = 'Limited Edition';
    box.appendChild(stamp);

    const styleEl = document.createElement('style');
    styleEl.textContent =
      '@keyframes figBurst { 0%,100% { transform: rotate(-12deg) scale(1); } 50% { transform: rotate(-12deg) scale(1.08); } }';
    document.head.appendChild(styleEl);

    document.body.appendChild(overlay);

    // Box intro
    requestAnimationFrame(() => {
      box.style.transform = 'scale(1)';
      box.style.opacity = '1';
    });

    // Interval handles in outer scope so the lock phase can clear them safely.
    const shuffled = order.slice().sort(() => Math.random() - 0.5);
    let idx = 0;
    let fastInterval = null;
    let slowInterval = null;

    setTimeout(() => {
      generating.style.opacity = '1';
      fastInterval = setInterval(() => {
        const pick = shuffled[idx % shuffled.length];
        nameLabel.textContent = String(pick.name).toUpperCase().slice(0, 13);
        avatarImg.src = pick.avatarUrl;
        idx++;
      }, 75);
    }, introMs);

    setTimeout(() => {
      if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
      slowInterval = setInterval(() => {
        const pick = shuffled[idx % shuffled.length];
        nameLabel.textContent = String(pick.name).toUpperCase().slice(0, 13);
        avatarImg.src = pick.avatarUrl;
        idx++;
      }, 180);
      generating.textContent = 'FINALIZING\u2026';
    }, introMs + cycleMs);

    setTimeout(() => {
      if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
      if (slowInterval) { clearInterval(slowInterval); slowInterval = null; }
      const winner = order[targetIndex];
      nameLabel.textContent = String(winner.name).toUpperCase().slice(0, 13);
      avatarImg.src = winner.avatarUrl;
      generating.style.opacity = '0';
      figureCard.style.boxShadow = '0 4px 0 #1b110a, 0 0 32px rgba(255,232,150,0.95)';
      // Stamp slam
      setTimeout(() => {
        stamp.style.opacity = '1';
        stamp.style.transform = 'translate(-50%, -50%) rotate(-18deg) scale(1.12)';
        setTimeout(() => {
          stamp.style.transform = 'translate(-50%, -50%) rotate(-18deg) scale(1)';
        }, 240);
      }, 80);
    }, introMs + cycleMs + slowMs);

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, introMs + cycleMs + slowMs + stampMs + holdMs);
  }

  /** Italian Brain Rot picker. Riffs on the 2026 TikTok AI-creature meme wave
   *  (Tralalero Tralala, Bombardiro Crocodilo, Cappuccino Assassino, etc.). A
   *  chaotic stage with floating emoji creatures, a glitchy name display flipping
   *  through random colors and rotations, and a bottom marquee of gibberish.
   *  The winner slams in under a gold "VINCITORE!" banner. */
