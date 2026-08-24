import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'brainrot';
export const label = 'Italian Brain Rot';

const ROTS = [
  { tag: 'BOMBARDIRO CROCODILO', suffix: 'CROCODILO', sky: '#5ec8ff', kind: 'croc' },
  { tag: 'TRALALERO TRALALA', suffix: 'TRALALA', sky: '#38b6ff', kind: 'shark' },
  { tag: 'LIRILI LARILA', suffix: 'LARILA', sky: '#7ed957', kind: 'cactus' },
  { tag: 'BRR BRR PATAPIM', suffix: 'PATAPIM', sky: '#8fd14f', kind: 'tree' },
  { tag: 'TUNG TUNG TUNG SAHUR', suffix: 'SAHUR', sky: '#e8b86d', kind: 'drum' },
  { tag: 'CAPPUCCINO ASSASSINO', suffix: 'ASSASSINO', sky: '#c4a07a', kind: 'coffee' },
  { tag: 'BANANITA DOLPHINITA', suffix: 'BANANITA', sky: '#ffe566', kind: 'banana' },
  { tag: 'BOMBOMBINI GUSINI', suffix: 'GUSINI', kind: 'goose', sky: '#9ad4ff' },
];

function beastSvg(kind, uid) {
  const g = uid + '_g';
  const ink = '#1b110a';
  const sw = ' stroke="' + ink + '" stroke-width="4" stroke-linejoin="round"';
  if (kind === 'croc') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#8be05a"/><stop offset="100%" stop-color="#2a6e1c"/></linearGradient></defs>' +
        '<ellipse cx="120" cy="206" rx="78" ry="10" fill="rgba(0,0,0,0.22)"/>' +
        '<path d="M18 108 L-6 78 L42 70 L58 100 Z" fill="#6b7280"' + sw + '/>' +
        '<path d="M186 86 L236 54 L246 92 L198 118 Z" fill="#6b7280"' + sw + '/>' +
        '<ellipse cx="132" cy="124" rx="96" ry="46" fill="url(#' + g + ')"' + sw + '/>' +
        '<ellipse cx="44" cy="128" rx="44" ry="26" fill="#62c43a"' + sw + '/>' +
        '<polygon points="12,120 28,120 28,132 12,132" fill="#fff"' + sw.replace('4', '2') + '/>' +
        '<polygon points="22,132 36,132 36,142 22,142" fill="#fff"' + sw.replace('4', '2') + '/>' +
        '<circle cx="14" cy="112" r="12" fill="#d7dbe3"' + sw + '/>' +
        '<rect x="70" y="72" width="100" height="22" rx="4" fill="#374151"' + sw + '/>' +
        '<circle cx="82" cy="83" r="5" fill="#ffcc00"/><circle cx="156" cy="83" r="5" fill="#ff3b30"/>' +
        '<ellipse cx="78" cy="168" rx="10" ry="8" fill="#c83a1e"' + sw + '/>' +
        '<ellipse cx="108" cy="172" rx="10" ry="8" fill="#c83a1e"' + sw + '/>' +
        '<path d="M210 124 Q244 110 248 136 Q218 150 204 138" fill="#3f8f28"' + sw + '/>' +
      '</svg>'
    );
  }
  if (kind === 'shark') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#4eb2ff"/><stop offset="100%" stop-color="#0a3f80"/></linearGradient></defs>' +
        '<ellipse cx="120" cy="208" rx="70" ry="10" fill="rgba(0,0,0,0.22)"/>' +
        '<path d="M120 10 L162 88 L78 88 Z" fill="url(#' + g + ')"' + sw + '/>' +
        '<ellipse cx="120" cy="112" rx="86" ry="54" fill="url(#' + g + ')"' + sw + '/>' +
        '<ellipse cx="122" cy="138" rx="58" ry="26" fill="#f4fbff"/>' +
        '<path d="M10 112 L-8 92 L18 138 Z" fill="#0a3f80"' + sw + '/>' +
        '<path d="M230 112 L252 86 L244 142 Z" fill="#0a3f80"' + sw + '/>' +
        '<polygon points="86,128 102,138 86,148" fill="#fff"' + sw.replace('4', '2') + '/>' +
        '<polygon points="138,128 154,138 138,148" fill="#fff"' + sw.replace('4', '2') + '/>' +
        '<rect x="48" y="154" width="52" height="36" rx="12" fill="#f7f7f7"' + sw + '/>' +
        '<rect x="140" y="154" width="52" height="36" rx="12" fill="#f7f7f7"' + sw + '/>' +
        '<rect x="48" y="176" width="52" height="14" fill="#e81dbb"' + sw.replace('4', '2') + '/>' +
        '<rect x="140" y="176" width="52" height="14" fill="#e81dbb"' + sw.replace('4', '2') + '/>' +
        '<path d="M58 166 Q74 156 92 166" fill="none" stroke="' + ink + '" stroke-width="3"/>' +
        '<path d="M150 166 Q166 156 184 166" fill="none" stroke="' + ink + '" stroke-width="3"/>' +
      '</svg>'
    );
  }
  if (kind === 'cactus') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#9aea72"/><stop offset="100%" stop-color="#2c7a28"/></linearGradient></defs>' +
        '<ellipse cx="120" cy="210" rx="70" ry="8" fill="#e2c56a"/>' +
        '<ellipse cx="46" cy="84" rx="32" ry="44" fill="#c48a5a"' + sw + '/>' +
        '<ellipse cx="194" cy="84" rx="32" ry="44" fill="#c48a5a"' + sw + '/>' +
        '<ellipse cx="46" cy="88" rx="16" ry="26" fill="#f0c4a0"/>' +
        '<ellipse cx="194" cy="88" rx="16" ry="26" fill="#f0c4a0"/>' +
        '<rect x="88" y="22" width="64" height="168" rx="32" fill="url(#' + g + ')"' + sw + '/>' +
        '<line x1="104" y1="40" x2="104" y2="170" stroke="#2c7a28" stroke-width="3"/>' +
        '<line x1="136" y1="48" x2="136" y2="172" stroke="#2c7a28" stroke-width="3"/>' +
        '<rect x="36" y="92" width="58" height="30" rx="15" fill="url(#' + g + ')"' + sw + '/>' +
        '<rect x="146" y="76" width="58" height="30" rx="15" fill="url(#' + g + ')"' + sw + '/>' +
        '<ellipse cx="74" cy="204" rx="26" ry="12" fill="#ffde59"' + sw + '/>' +
        '<ellipse cx="166" cy="204" rx="26" ry="12" fill="#ffde59"' + sw + '/>' +
        '<path d="M60 200 Q74 188 88 200" fill="none" stroke="#e81dbb" stroke-width="4"/>' +
        '<path d="M152 200 Q166 188 180 200" fill="none" stroke="#e81dbb" stroke-width="4"/>' +
      '</svg>'
    );
  }
  if (kind === 'tree') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<ellipse cx="120" cy="210" rx="56" ry="8" fill="rgba(0,0,0,0.2)"/>' +
        '<rect x="98" y="96" width="44" height="108" rx="12" fill="#7a4a22"' + sw + '/>' +
        '<circle cx="120" cy="64" r="68" fill="#3d9a32"' + sw + '/>' +
        '<circle cx="62" cy="84" r="32" fill="#2f7a28"' + sw.replace('4', '3') + '/>' +
        '<circle cx="178" cy="78" r="34" fill="#4cb338"' + sw.replace('4', '3') + '/>' +
        '<ellipse cx="86" cy="204" rx="22" ry="14" fill="#3a2414"' + sw + '/>' +
        '<ellipse cx="154" cy="204" rx="22" ry="14" fill="#3a2414"' + sw + '/>' +
        '<circle cx="70" cy="120" r="8" fill="#e81dbb"' + sw.replace('4', '2') + '/>' +
        '<circle cx="168" cy="108" r="8" fill="#ffde59"' + sw.replace('4', '2') + '/>' +
      '</svg>'
    );
  }
  if (kind === 'drum') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="#d4a05a"/><stop offset="50%" stop-color="#8a5a28"/>' +
          '<stop offset="100%" stop-color="#d4a05a"/></linearGradient></defs>' +
        '<ellipse cx="120" cy="210" rx="48" ry="8" fill="rgba(0,0,0,0.2)"/>' +
        '<rect x="72" y="40" width="96" height="156" rx="20" fill="url(#' + g + ')"' + sw + '/>' +
        '<ellipse cx="120" cy="40" rx="48" ry="18" fill="#f0d6a0"' + sw + '/>' +
        '<line x1="90" y1="64" x2="90" y2="176" stroke="' + ink + '" stroke-width="3"/>' +
        '<line x1="150" y1="64" x2="150" y2="176" stroke="' + ink + '" stroke-width="3"/>' +
        '<rect x="16" y="84" width="56" height="12" rx="6" fill="#5a3a18"' + sw + '/>' +
        '<rect x="168" y="84" width="56" height="12" rx="6" fill="#5a3a18"' + sw + '/>' +
        '<circle cx="16" cy="90" r="12" fill="#d99a2b"' + sw + '/>' +
        '<circle cx="224" cy="90" r="12" fill="#d99a2b"' + sw + '/>' +
      '</svg>'
    );
  }
  if (kind === 'coffee') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#a06638"/><stop offset="100%" stop-color="#3a2210"/></linearGradient></defs>' +
        '<ellipse cx="120" cy="210" rx="56" ry="8" fill="rgba(0,0,0,0.2)"/>' +
        '<path d="M64 66 L176 66 L162 184 Q120 208 78 184 Z" fill="url(#' + g + ')"' + sw + '/>' +
        '<ellipse cx="120" cy="66" rx="58" ry="18" fill="#f7ead0"' + sw + '/>' +
        '<ellipse cx="104" cy="60" rx="20" ry="9" fill="#fff8ea"/>' +
        '<path d="M176 90 Q222 98 218 138 Q212 170 168 156" fill="none" stroke="' + ink + '" stroke-width="8"/>' +
        '<rect x="72" y="96" width="96" height="22" rx="6" fill="#1b110a"/>' +
        '<rect x="82" y="101" width="32" height="12" rx="3" fill="#6ec8ff"/>' +
        '<rect x="126" y="101" width="32" height="12" rx="3" fill="#6ec8ff"/>' +
        '<rect x="14" y="126" width="54" height="18" rx="4" fill="#2a2a2a"' + sw + '/>' +
        '<rect x="172" y="126" width="54" height="18" rx="4" fill="#2a2a2a"' + sw + '/>' +
        '<circle cx="22" cy="135" r="6" fill="#555"/><circle cx="218" cy="135" r="6" fill="#555"/>' +
      '</svg>'
    );
  }
  if (kind === 'banana') {
    return (
      '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
        '<defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1">' +
          '<stop offset="0%" stop-color="#ffe566"/><stop offset="100%" stop-color="#d99a2b"/></linearGradient></defs>' +
        '<ellipse cx="120" cy="210" rx="52" ry="8" fill="rgba(0,0,0,0.2)"/>' +
        '<path d="M64 32 Q24 120 82 200 Q122 176 132 108 Q138 52 96 32 Z" fill="url(#' + g + ')"' + sw + '/>' +
        '<path d="M96 32 Q122 16 156 44 Q214 112 176 198 Q144 174 136 108 Q132 62 110 42 Z" fill="#ffe566"' + sw + '/>' +
        '<path d="M154 66 L190 28 L178 82 Z" fill="#38b6ff"' + sw + '/>' +
        '<ellipse cx="176" cy="198" rx="26" ry="14" fill="#38b6ff"' + sw + '/>' +
        '<rect x="84" y="18" width="22" height="20" rx="5" fill="#3d9a32"' + sw + '/>' +
      '</svg>'
    );
  }
  return (
    '<svg viewBox="0 0 240 220" width="100%" height="100%" aria-hidden="true">' +
      '<ellipse cx="120" cy="210" rx="56" ry="8" fill="rgba(0,0,0,0.2)"/>' +
      '<ellipse cx="124" cy="130" rx="64" ry="52" fill="#f7f3ea"' + sw + '/>' +
      '<path d="M64 118 Q36 78 12 118 Q36 158 64 136" fill="#f7f3ea"' + sw + '/>' +
      '<path d="M184 118 Q226 58 246 108 Q228 160 180 140" fill="#f7f3ea"' + sw + '/>' +
      '<path d="M84 172 Q98 206 72 216" fill="none" stroke="' + ink + '" stroke-width="6"/>' +
      '<path d="M160 172 Q176 208 198 216" fill="none" stroke="' + ink + '" stroke-width="6"/>' +
      '<ellipse cx="124" cy="64" rx="46" ry="40" fill="#f7f3ea"' + sw + '/>' +
      '<ellipse cx="124" cy="46" rx="40" ry="18" fill="#c83a1e"' + sw + '/>' +
      '<rect x="94" y="38" width="60" height="12" rx="3" fill="#d99a2b"/>' +
    '</svg>'
  );
}

function facePos(kind) {
  if (kind === 'croc') return { left: '18%', top: '38%' };
  if (kind === 'shark') return { left: '38%', top: '28%' };
  if (kind === 'cactus') return { left: '38%', top: '22%' };
  if (kind === 'tree') return { left: '38%', top: '14%' };
  if (kind === 'drum') return { left: '38%', top: '28%' };
  if (kind === 'coffee') return { left: '38%', top: '32%' };
  if (kind === 'banana') return { left: '42%', top: '28%' };
  return { left: '38%', top: '16%' };
}

function makeBeast(person, i) {
  const rot = ROTS[i % ROTS.length];
  const wrap = document.createElement('div');
  wrap.style.cssText =
    'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'opacity:0;transform:scale(0.82) rotate(-6deg);pointer-events:none;' +
    'transition:opacity 0.08s linear, transform 0.12s ease;';

  const figure = document.createElement('div');
  figure.style.cssText = 'position:relative;width:330px;height:310px;z-index:2;';
  figure.innerHTML = beastSvg(rot.kind, 'br' + i);
  const pos = facePos(rot.kind);
  const face = document.createElement('img');
  face.src = person.avatarUrl;
  face.alt = '';
  face.style.cssText =
    'position:absolute;left:' + pos.left + ';top:' + pos.top + ';width:78px;height:78px;' +
    'border-radius:50%;object-fit:cover;border:3px solid #1b110a;background:#fbf4dd;' +
    'box-shadow:0 3px 0 #1b110a;z-index:4;';
  figure.appendChild(face);
  wrap.appendChild(figure);
  wrap._rot = rot;
  wrap._person = person;
  return wrap;
}

function captionCss() {
  return (
    'font-family:Impact,"Arial Black",sans-serif;font-weight:900;text-transform:uppercase;' +
    'color:#fff;letter-spacing:1px;line-height:0.95;text-align:center;' +
    '-webkit-text-stroke:3px #1b110a;' +
    'text-shadow:4px 4px 0 #1b110a, 0 0 18px rgba(0,0,0,0.45);'
  );
}

/** Italian Brain Rot: TikTok-style AI chimera reel. Each name is a different
 *  creature (crocodilo, shark-with-Nikes, cappuccino assassino…). Fast cuts,
 *  then the winner freezes as the vincitore. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  const totalMs = CONFIG.spinDuration;
  const cycleMs = Math.max(700, Math.round(totalMs * 0.50));
  const slowMs = Math.max(300, Math.round(totalMs * 0.18));
  const slamMs = Math.max(400, Math.round(totalMs * 0.18));
  const holdMs = Math.max(250, totalMs - cycleMs - slowMs - slamMs);

  const headline = document.createElement('div');
  headline.textContent = 'Italian Brain Rot';
  headline.style.cssText =
    'font-family:"Rye","Times New Roman",serif;font-size:22px;letter-spacing:3px;' +
    'color:#fbf4dd;text-shadow:0 3px 0 rgba(0,0,0,0.55);text-transform:uppercase;';
  overlay.appendChild(headline);

  const phone = document.createElement('div');
  phone.style.cssText =
    'position:relative;width:360px;height:540px;overflow:hidden;' +
    'background:#111;border:6px solid #1b110a;border-radius:36px;' +
    'box-shadow:0 24px 50px rgba(0,0,0,0.7), inset 0 0 0 3px #3a3a3a;';
  overlay.appendChild(phone);

  const notch = document.createElement('div');
  notch.style.cssText =
    'position:absolute;left:50%;top:8px;width:96px;height:18px;margin-left:-48px;z-index:12;' +
    'background:#1b110a;border-radius:12px;';
  phone.appendChild(notch);

  const sky = document.createElement('div');
  sky.style.cssText =
    'position:absolute;inset:0;background:linear-gradient(180deg,#7ed6ff 0%,#38b6ff 42%,#7ed957 100%);' +
    'transition:background 0.12s linear;';
  phone.appendChild(sky);

  const flag = document.createElement('div');
  flag.style.cssText =
    'position:absolute;left:0;right:0;top:0;height:10px;z-index:8;display:flex;';
  flag.innerHTML =
    '<div style="flex:1;background:#009246"></div>' +
    '<div style="flex:1;background:#f1f1f1"></div>' +
    '<div style="flex:1;background:#ce2b37"></div>';
  phone.appendChild(flag);

  const sun = document.createElement('div');
  sun.style.cssText =
    'position:absolute;right:28px;top:36px;width:54px;height:54px;border-radius:50%;' +
    'background:#ffde59;border:3px solid #1b110a;box-shadow:0 4px 0 #1b110a;';
  phone.appendChild(sun);

  const host = document.createElement('div');
  host.style.cssText =
    'position:absolute;left:0;right:0;top:22px;bottom:108px;z-index:3;';
  phone.appendChild(host);

  const beasts = order.map((p, i) => makeBeast(p, i));
  beasts.forEach((b) => host.appendChild(b));

  const capWrap = document.createElement('div');
  capWrap.style.cssText =
    'position:absolute;left:14px;right:58px;bottom:52px;z-index:7;';
  const handle = document.createElement('div');
  handle.textContent = '@italianbrainrot';
  handle.style.cssText =
    'font-family:"JetBrains Mono","Menlo",monospace;font-size:12px;font-weight:700;' +
    'color:#fff;text-shadow:0 1px 3px #000;margin-bottom:6px;';
  const line1 = document.createElement('div');
  line1.style.cssText = captionCss() + 'font-size:28px;';
  line1.textContent = '???';
  const line2 = document.createElement('div');
  line2.style.cssText = captionCss() + 'font-size:22px;color:#ffde59;margin-top:4px;';
  line2.textContent = 'LOADING…';
  capWrap.appendChild(handle);
  capWrap.appendChild(line1);
  capWrap.appendChild(line2);
  phone.appendChild(capWrap);

  const rail = document.createElement('div');
  rail.style.cssText =
    'position:absolute;right:10px;bottom:56px;z-index:8;display:flex;flex-direction:column;' +
    'align-items:center;gap:14px;color:#fff;font-family:"JetBrains Mono","Menlo",monospace;' +
    'font-size:10px;font-weight:700;text-shadow:0 1px 2px #000;';
  [
    ['\u2665', '842K'],
    ['\uD83D\uDCAC', '19K'],
    ['\u27A4', 'Share'],
    ['\uD83C\uDFB5', ''],
  ].forEach((pair) => {
    const item = document.createElement('div');
    item.style.cssText = 'text-align:center;line-height:1.15;';
    item.innerHTML =
      '<div style="font-size:22px;filter:drop-shadow(0 2px 0 #1b110a)">' + pair[0] + '</div>' +
      (pair[1] ? '<div>' + pair[1] + '</div>' : '');
    rail.appendChild(item);
  });
  phone.appendChild(rail);

  const marqueeWrap = document.createElement('div');
  marqueeWrap.style.cssText =
    'position:absolute;left:0;right:0;bottom:0;height:34px;z-index:9;' +
    'background:rgba(0,0,0,0.72);overflow:hidden;display:flex;align-items:center;' +
    'border-top:2px solid #1b110a;';
  const marqueePhrase =
    'BOMBARDIRO CROCODILO \u2666 TRALALERO TRALALA \u2666 LIRILI LARILA \u2666 ' +
    'BRR BRR PATAPIM \u2666 TUNG TUNG TUNG SAHUR \u2666 BANANITA DOLPHINITA \u2666 ' +
    'CAPPUCCINO ASSASSINO \u2666 BOMBOMBINI GUSINI \u2666 ';
  const marqueeText = document.createElement('div');
  marqueeText.textContent = marqueePhrase + marqueePhrase;
  marqueeText.style.cssText =
    'white-space:nowrap;color:#fbf4dd;font-family:"JetBrains Mono","Menlo",monospace;' +
    'font-size:11px;font-weight:700;letter-spacing:1.5px;animation:brMarquee 9s linear infinite;';
  marqueeWrap.appendChild(marqueeText);
  phone.appendChild(marqueeWrap);

  const banner = document.createElement('div');
  banner.style.cssText =
    'position:absolute;left:50%;top:44px;transform:translateX(-50%) rotate(-8deg) scale(0.2);' +
    'padding:8px 22px;background:#ce2b37;border:4px solid #1b110a;border-radius:8px;' +
    'font-family:Impact,"Arial Black",sans-serif;font-size:26px;color:#fff;' +
    'letter-spacing:2px;text-transform:uppercase;z-index:10;opacity:0;' +
    '-webkit-text-stroke:2px #1b110a;' +
    'box-shadow:0 6px 0 #1b110a, 0 0 24px rgba(255,220,80,0.7);' +
    'transition:opacity 0.18s ease, transform 0.4s cubic-bezier(0.3,1.6,0.5,1);';
  banner.textContent = 'VINCITORE!';
  phone.appendChild(banner);

  const glitch = document.createElement('div');
  glitch.style.cssText =
    'position:absolute;inset:0;pointer-events:none;z-index:11;mix-blend-mode:overlay;' +
    'background:repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0, rgba(0,0,0,0.12) 1px, transparent 2px, transparent 4px);' +
    'animation:brScan 0.12s steps(2) infinite;';
  phone.appendChild(glitch);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes brWobble { 0%,100% { transform: translate(0,0); } 25% { transform: translate(-2px,1px); } 50% { transform: translate(2px,-1px); } 75% { transform: translate(-1px,0); } }' +
    '@keyframes brMarquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }' +
    '@keyframes brScan { 0%,100% { opacity:0.55; } 50% { opacity:0.9; } }' +
    '@keyframes brPop { 0% { transform: scale(0.7) rotate(-12deg); } 60% { transform: scale(1.12) rotate(4deg); } 100% { transform: scale(1) rotate(0deg); } }';
  document.head.appendChild(styleEl);
  document.body.appendChild(overlay);

  let shown = -1;
  let idx = 0;
  let fastInterval = null;
  let slowInterval = null;

  function showIndex(i, hard) {
    const n = beasts.length;
    const next = ((i % n) + n) % n;
    if (shown === next && !hard) return;
    beasts.forEach((b, j) => {
      const on = j === next;
      b.style.opacity = on ? '1' : '0';
      b.style.transform = on
        ? 'scale(1) rotate(' + (Math.random() * 10 - 5).toFixed(1) + 'deg)'
        : 'scale(0.82) rotate(-6deg)';
    });
    shown = next;
    const b = beasts[next];
    const rot = b._rot;
    const name = String(b._person.name).toUpperCase();
    line1.textContent = name;
    line2.textContent = rot.suffix + '!';
    sky.style.background =
      'linear-gradient(180deg,' + rot.sky + ' 0%,#38b6ff 40%,' + rot.sky + ' 100%)';
  }

  showIndex(0, true);

  fastInterval = setInterval(() => {
    idx++;
    showIndex(idx);
  }, 90);

  setTimeout(() => {
    if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
    slowInterval = setInterval(() => {
      idx++;
      showIndex(idx);
    }, 200);
  }, cycleMs);

  setTimeout(() => {
    if (fastInterval) { clearInterval(fastInterval); fastInterval = null; }
    if (slowInterval) { clearInterval(slowInterval); slowInterval = null; }
    glitch.style.opacity = '0.2';
    showIndex(targetIndex, true);
    const winnerBeast = beasts[targetIndex];
    winnerBeast.style.animation = 'brPop 0.45s cubic-bezier(0.3,1.5,0.5,1) both';
    winnerBeast.style.transform = 'scale(1.08) rotate(-2deg)';
    line1.textContent = String(order[targetIndex].name).toUpperCase();
    line2.textContent = winnerBeast._rot.tag;
    sky.style.background = 'linear-gradient(180deg,#ffde59 0%,#7ed6ff 45%,#7ed957 100%)';
    setTimeout(() => {
      banner.style.opacity = '1';
      banner.style.transform = 'translateX(-50%) rotate(-8deg) scale(1.08)';
      setTimeout(() => {
        banner.style.transform = 'translateX(-50%) rotate(-8deg) scale(1)';
      }, 220);
    }, 40);
  }, cycleMs + slowMs);

  setTimeout(() => {
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, cycleMs + slowMs + slamMs + holdMs);
}
