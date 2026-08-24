import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'hack';
export const label = 'Hack terminal';

const GLYPHS = '01アカサタナハマヤラワ0123456789ABCDEF#$%&<>/\\|';

/** CRT hacker HUD: matrix rain, biometric scan of avatars, then ACCESS GRANTED. */
export function show(order, targetIndex) {
  const overlay = createPickerOverlay();
  overlay.style.background = '#010302';
  overlay.style.gap = '16px';

  const winner = order[targetIndex];
  const totalMs = Math.max(CONFIG.spinDuration, 2800);
  const scanMs = Math.max(1100, Math.round(totalMs * 0.52));
  const lockMs = Math.max(500, Math.round(totalMs * 0.22));
  const holdMs = Math.max(400, totalMs - scanMs - lockMs);
  const uid = 'hack_' + Date.now();
  const n = Math.max(1, order.length);

  const styleEl = document.createElement('style');
  styleEl.textContent =
    '@keyframes ' + uid + '_blink { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }' +
    '@keyframes ' + uid + '_scan { 0% { top:-18% } 100% { top:108% } }' +
    '@keyframes ' + uid + '_flicker { 0%,92%,100% { opacity:1 } 93% { opacity:0.72 } 96% { opacity:0.9 } }' +
    '@keyframes ' + uid + '_glow { from { box-shadow:0 0 18px rgba(57,255,20,0.18),0 24px 50px rgba(0,0,0,0.75) }' +
    ' to { box-shadow:0 0 36px rgba(57,255,20,0.45),0 24px 50px rgba(0,0,0,0.75) } }' +
    '@keyframes ' + uid + '_reticle { 0%,100% { transform:scale(1) } 50% { transform:scale(0.92) } }';
  document.head.appendChild(styleEl);

  const rain = document.createElement('canvas');
  rain.width = 720;
  rain.height = 480;
  rain.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;opacity:0.22;pointer-events:none;';
  overlay.appendChild(rain);
  const rctx = rain.getContext('2d');
  const colW = 14;
  let cols = 0;
  let drops = [];
  const sizeRain = () => {
    rain.width = overlay.clientWidth || 720;
    rain.height = overlay.clientHeight || 480;
    cols = Math.max(8, Math.floor(rain.width / colW));
    drops = Array.from({ length: cols }, () => Math.random() * -40);
  };
  sizeRain();
  let rainRaf = 0;
  let alive = true;
  const tickRain = () => {
    if (!alive) return;
    rctx.fillStyle = 'rgba(1,3,2,0.18)';
    rctx.fillRect(0, 0, rain.width, rain.height);
    rctx.font = '13px "JetBrains Mono", Menlo, monospace';
    for (let i = 0; i < cols; i++) {
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      const x = i * colW;
      const y = drops[i] * 18;
      rctx.fillStyle = i % 7 === 0 ? '#d7ffd0' : '#39ff14';
      rctx.fillText(ch, x, y);
      if (y > rain.height && Math.random() > 0.975) drops[i] = 0;
      else drops[i]++;
    }
    rainRaf = requestAnimationFrame(tickRain);
  };
  rainRaf = requestAnimationFrame(tickRain);

  const headline = document.createElement('div');
  headline.textContent = 'INTRUSION';
  headline.style.cssText =
    'position:relative;z-index:2;font-family:"Rye","Times New Roman",serif;font-size:22px;' +
    'letter-spacing:4px;color:#39ff14;text-shadow:0 0 12px #39ff14;text-transform:uppercase;';
  overlay.appendChild(headline);

  const stage = document.createElement('div');
  stage.style.cssText =
    'position:relative;z-index:2;width:640px;height:420px;overflow:hidden;' +
    'background:linear-gradient(180deg,#07140a 0%,#020804 100%);' +
    'border:3px solid #1bff4a;border-radius:10px;' +
    'box-shadow:0 0 22px rgba(57,255,20,0.22),0 24px 50px rgba(0,0,0,0.75),inset 0 0 80px rgba(57,255,20,0.06);' +
    'font-family:"JetBrains Mono",Menlo,Consolas,monospace;color:#7CFF8A;' +
    'animation:' + uid + '_glow 1.1s ease-in-out infinite alternate,' + uid + '_flicker 3.4s steps(1) infinite;';
  overlay.appendChild(stage);

  const chrome = document.createElement('div');
  chrome.style.cssText =
    'display:flex;align-items:center;gap:8px;height:32px;padding:0 12px;' +
    'background:rgba(0,20,8,0.9);border-bottom:1px solid rgba(57,255,20,0.35);';
  const dots = document.createElement('div');
  dots.style.cssText = 'display:flex;gap:6px;';
  ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((c) => {
    const d = document.createElement('div');
    d.style.cssText = 'width:10px;height:10px;border-radius:50%;background:' + c + ';box-shadow:0 0 0 1px rgba(0,0,0,0.35);';
    dots.appendChild(d);
  });
  chrome.appendChild(dots);
  const title = document.createElement('div');
  title.textContent = 'root@standup — /opt/picker/breach.sh';
  title.style.cssText = 'flex:1;text-align:center;font-size:11px;letter-spacing:0.6px;color:#8dff9a;opacity:0.85;';
  chrome.appendChild(title);
  stage.appendChild(chrome);

  const body = document.createElement('div');
  body.style.cssText = 'display:flex;height:calc(100% - 64px);';
  stage.appendChild(body);

  const logWrap = document.createElement('div');
  logWrap.style.cssText =
    'flex:1;padding:12px 14px 8px;overflow:hidden;text-align:left;font-size:12px;line-height:1.55;';
  const pre = document.createElement('pre');
  pre.style.cssText = 'margin:0;font-family:inherit;color:inherit;white-space:pre-wrap;word-break:break-word;min-height:100%;';
  const cursor = document.createElement('span');
  cursor.textContent = '\u258B';
  cursor.style.cssText = 'animation:' + uid + '_blink 0.7s steps(1) infinite;color:#39ff14;';
  logWrap.appendChild(pre);
  body.appendChild(logWrap);

  const scan = document.createElement('div');
  scan.style.cssText =
    'width:236px;flex-shrink:0;border-left:1px solid rgba(57,255,20,0.28);' +
    'padding:12px 14px;display:flex;flex-direction:column;align-items:center;gap:8px;';
  const scanLbl = document.createElement('div');
  scanLbl.textContent = 'BIOMETRIC LOCK';
  scanLbl.style.cssText = 'font-size:10px;letter-spacing:2px;color:#39ff14;';
  scan.appendChild(scanLbl);

  const frame = document.createElement('div');
  frame.style.cssText =
    'position:relative;width:148px;height:148px;overflow:hidden;' +
    'border:2px solid #39ff14;background:#031006;' +
    'box-shadow:0 0 16px rgba(57,255,20,0.35),inset 0 0 24px rgba(57,255,20,0.12);';
  const face = document.createElement('img');
  face.src = order[0].avatarUrl;
  face.alt = '';
  face.style.cssText =
    'width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.25) brightness(0.85) sepia(1) hue-rotate(70deg);';
  frame.appendChild(face);

  const sweep = document.createElement('div');
  sweep.style.cssText =
    'position:absolute;left:0;right:0;height:18%;pointer-events:none;' +
    'background:linear-gradient(180deg,transparent,rgba(57,255,20,0.55),transparent);' +
    'animation:' + uid + '_scan 1.15s linear infinite;';
  frame.appendChild(sweep);

  const reticle = document.createElement('div');
  reticle.style.cssText =
    'position:absolute;inset:10px;border:1px solid rgba(57,255,20,0.7);pointer-events:none;' +
    'animation:' + uid + '_reticle 0.9s ease-in-out infinite;';
  reticle.innerHTML =
    '<div style="position:absolute;top:-1px;left:-1px;width:14px;height:14px;border-top:2px solid #39ff14;border-left:2px solid #39ff14;"></div>' +
    '<div style="position:absolute;top:-1px;right:-1px;width:14px;height:14px;border-top:2px solid #39ff14;border-right:2px solid #39ff14;"></div>' +
    '<div style="position:absolute;bottom:-1px;left:-1px;width:14px;height:14px;border-bottom:2px solid #39ff14;border-left:2px solid #39ff14;"></div>' +
    '<div style="position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-bottom:2px solid #39ff14;border-right:2px solid #39ff14;"></div>';
  frame.appendChild(reticle);
  scan.appendChild(frame);

  const scanName = document.createElement('div');
  scanName.textContent = order[0].name;
  scanName.style.cssText =
    'font-size:13px;font-weight:600;color:#d7ffd0;text-align:center;max-width:200px;' +
    'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  scan.appendChild(scanName);

  const hex = document.createElement('div');
  hex.style.cssText = 'font-size:9px;line-height:1.4;color:#3d9a4a;text-align:center;letter-spacing:0.4px;opacity:0.85;';
  hex.textContent = '0x' + hashHex(order[0].name);
  scan.appendChild(hex);

  const match = document.createElement('div');
  match.textContent = 'MATCH  12%';
  match.style.cssText = 'font-size:11px;letter-spacing:1px;color:#ffbd2e;margin-top:auto;';
  scan.appendChild(match);
  body.appendChild(scan);

  const status = document.createElement('div');
  status.style.cssText =
    'height:32px;display:flex;align-items:center;gap:10px;padding:0 12px;' +
    'border-top:1px solid rgba(57,255,20,0.28);background:rgba(0,12,6,0.85);font-size:10px;letter-spacing:1px;';
  const statusLbl = document.createElement('div');
  statusLbl.textContent = 'DUMPING PERSONNEL DB';
  statusLbl.style.cssText = 'color:#8dff9a;white-space:nowrap;';
  const barWrap = document.createElement('div');
  barWrap.style.cssText = 'flex:1;height:8px;border:1px solid #39ff14;background:#031006;overflow:hidden;';
  const bar = document.createElement('div');
  bar.style.cssText =
    'width:0%;height:100%;background:linear-gradient(90deg,#145c22,#39ff14);' +
    'box-shadow:0 0 8px #39ff14;transition:width 0.12s linear;';
  barWrap.appendChild(bar);
  const pct = document.createElement('div');
  pct.textContent = '0%';
  pct.style.cssText = 'width:36px;text-align:right;color:#39ff14;';
  status.appendChild(statusLbl);
  status.appendChild(barWrap);
  status.appendChild(pct);
  stage.appendChild(status);

  const crt = document.createElement('div');
  crt.style.cssText =
    'position:absolute;inset:32px 0 32px;pointer-events:none;' +
    'background:repeating-linear-gradient(0deg,rgba(0,0,0,0.16) 0,rgba(0,0,0,0.16) 1px,transparent 2px,transparent 3px);';
  stage.appendChild(crt);
  document.body.appendChild(overlay);

  const lines = [
    '> boot /opt/picker/breach.sh --quiet',
    '> handshake tls://standup.local ........ OK',
    '> AUTH BYPASS  ......................... OK',
    '> loaded ' + n + ' personnel records',
    '> filter vibe="standup-ready"',
    '> chaotic_neutral_index DESC',
    '> brute-forcing speaker lock ...',
  ];

  let acc = '';
  const typeUntil = scanMs + lockMs * 0.35;
  const perLine = typeUntil / lines.length;
  lines.forEach((line, i) => {
    setTimeout(() => {
      acc += line + '\n';
      pre.textContent = acc;
      pre.appendChild(cursor);
    }, 80 + i * perLine);
  });

  let scanIdx = 0;
  const scanStart = Date.now();
  const tickMs = Math.max(70, Math.round(scanMs / Math.max(10, n * 3)));
  const scanTimer = setInterval(() => {
    scanIdx = (scanIdx + 1) % n;
    if (scanIdx === targetIndex && Math.random() > 0.35) scanIdx = (scanIdx + 1) % n;
    const person = order[scanIdx];
    face.src = person.avatarUrl;
    scanName.textContent = person.name;
    hex.textContent = '0x' + hashHex(person.name);
    const p = Math.min(88, Math.round(((Date.now() - scanStart) / scanMs) * 88));
    match.textContent = 'MATCH  ' + p + '%';
  }, tickMs);

  let fill = 0;
  const barTimer = setInterval(() => {
    fill = Math.min(92, fill + 4 + Math.random() * 6);
    bar.style.width = fill + '%';
    pct.textContent = Math.round(fill) + '%';
  }, 90);

  setTimeout(() => {
    clearInterval(scanTimer);
    face.src = winner.avatarUrl;
    scanName.textContent = winner.name;
    hex.textContent = '0x' + hashHex(winner.name);
    match.textContent = 'MATCH  99%';
    match.style.color = '#ffbd2e';
    frame.style.borderColor = '#ffbd2e';
    acc += '> candidate locked\n';
    pre.textContent = acc;
    pre.appendChild(cursor);
  }, scanMs);

  setTimeout(() => {
    clearInterval(barTimer);
    bar.style.width = '100%';
    pct.textContent = '100%';
    statusLbl.textContent = 'ACCESS GRANTED';
    statusLbl.style.color = '#39ff14';
    match.textContent = 'MATCH  100%';
    match.style.color = '#39ff14';
    frame.style.borderColor = '#39ff14';
    frame.style.boxShadow = '0 0 28px rgba(57,255,20,0.75),inset 0 0 24px rgba(57,255,20,0.2)';
    face.style.filter = 'contrast(1.1) brightness(1.05)';
    sweep.style.animation = 'none';
    acc += '\n> >>> ACCESS GRANTED <<<\n> SPEAKER  ' + winner.name + '\n';
    pre.textContent = acc;
    pre.appendChild(cursor);
  }, scanMs + lockMs);

  setTimeout(() => {
    alive = false;
    cancelAnimationFrame(rainRaf);
    clearInterval(scanTimer);
    clearInterval(barTimer);
    overlay.remove();
    styleEl.remove();
    revealWinner(order, targetIndex);
  }, totalMs + 80);
}

function hashHex(s) {
  let h = 0x811c9dc5;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
}
