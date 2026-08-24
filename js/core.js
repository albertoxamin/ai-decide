/** Shared picker runtime: overlay, avatars, winner modal, spin config. */

export const CONFIG = {
  spinDuration: 3000,
  extraSpin: 360 * 5,
  wheelSize: 400,
  tickerSize: 20,
  segmentColors: ['#e9f2ff', '#d6e4ff', '#e81dbb', '#09c5a7', '#e9cdb6', '#4c4349', '#0cc846'],
};

export function createPickerOverlay() {
  const overlay = document.createElement('div');
  overlay.setAttribute('data-standup-overlay', 'picker');
  overlay.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);' +
    'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
    'gap:24px;z-index:9999;perspective:1400px;';
  return overlay;
}

let _suppressedReveals = 0;

export function dismissActiveOverlays() {
  document.querySelectorAll('[data-standup-overlay]').forEach((el) => {
    if (el.getAttribute('data-standup-overlay') === 'picker') {
      _suppressedReveals++;
    }
    el.remove();
  });
}

const AVATAR_PALETTE = [
  '#e81dbb', '#0cc846', '#ff9500', '#007aff', '#5856d6',
  '#af52de', '#ff2d55', '#34c759', '#ff3b30', '#ffcc00',
  '#1abc9c', '#3498db', '#e67e22', '#9b59b6', '#2ecc71',
  '#e74c3c', '#f39c12', '#16a085', '#27ae60', '#d35400',
];
const _avatarCache = new Map();

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function generateAvatar(name) {
  const key = String(name || '');
  if (_avatarCache.has(key)) return _avatarCache.get(key);
  const initials = getInitials(key);
  const color = AVATAR_PALETTE[hashString(key.toLowerCase()) % AVATAR_PALETTE.length];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">' +
    '<circle cx="64" cy="64" r="64" fill="' + color + '"/>' +
    '<text x="50%" y="50%" dy="0.36em" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="56" font-weight="700" fill="#ffffff">' +
    initials +
    '</text></svg>';
  const url = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  _avatarCache.set(key, url);
  return url;
}

export function buildPeople(names) {
  return names
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((name, i) => ({ name, avatarUrl: generateAvatar(name), id: 'p' + i }));
}

function createConfetti(container) {
  const colors = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55'];
  const confettiCount = 100;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * 100;
    const duration = Math.random() * 2000 + 2000;
    const delay = Math.random() * 500;
    const rotation = Math.random() * 360;
    confetti.style.position = 'absolute';
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    confetti.style.backgroundColor = color;
    confetti.style.left = startX + '%';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.opacity = '0';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '10000';
    container.appendChild(confetti);
    setTimeout(() => {
      confetti.style.transition = 'all ' + duration + 'ms ease-out';
      confetti.style.opacity = '1';
      confetti.style.transform =
        'translateY(' + (window.innerHeight + 100) + 'px) rotate(' + (rotation + 720) + 'deg)';
      confetti.style.left = startX + (Math.random() - 0.5) * 20 + '%';
    }, delay);
    setTimeout(() => {
      confetti.remove();
    }, delay + duration);
  }
}

export function showWinnerPopup(winnerName, winnerAvatar) {
  const popupOverlay = document.createElement('div');
  popupOverlay.setAttribute('data-standup-overlay', 'modal');
  popupOverlay.style.cssText =
    'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);' +
    'display:flex;align-items:center;justify-content:center;z-index:10001;animation:fadeIn 0.3s ease-out;';

  const style = document.createElement('style');
  style.textContent =
    '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }' +
    '@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }' +
    '@keyframes bounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }';
  document.head.appendChild(style);

  const popup = document.createElement('div');
  popup.style.cssText =
    'background:#fff;border-radius:16px;padding:32px;box-shadow:0 20px 60px rgba(0,0,0,0.3);' +
    'text-align:center;max-width:400px;width:90%;position:relative;animation:slideUp 0.4s ease-out;z-index:10002;color:#333;';

  const emoji = document.createElement('div');
  emoji.textContent = '\uD83C\uDF89';
  emoji.style.cssText = 'font-size:64px;margin-bottom:16px;animation:bounce 0.6s ease-in-out 3;';
  popup.appendChild(emoji);

  const title = document.createElement('div');
  title.textContent = 'And the pick is\u2026';
  title.style.cssText = 'font-size:18px;color:#666;margin-bottom:12px;font-weight:500;';
  popup.appendChild(title);

  const avatar = document.createElement('img');
  avatar.src = winnerAvatar;
  avatar.style.cssText =
    'width:96px;height:96px;border-radius:50%;margin-bottom:16px;border:4px solid #4c6ef5;object-fit:cover;';
  popup.appendChild(avatar);

  const name = document.createElement('div');
  name.textContent = winnerName;
  name.style.cssText = 'font-size:28px;font-weight:700;color:#333;margin-bottom:24px;';
  popup.appendChild(name);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Spin again';
  closeBtn.style.cssText =
    'padding:12px 32px;border-radius:10px;border:none;background:#4c6ef5;color:#fff;' +
    'font-size:15px;font-weight:600;cursor:pointer;transition:background 0.15s;';
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#3b5bdb';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#4c6ef5';
  });

  const closeModal = () => {
    popupOverlay.style.animation = 'fadeIn 0.15s ease-out reverse';
    setTimeout(() => {
      popupOverlay.remove();
      style.remove();
    }, 150);
  };
  closeBtn.addEventListener('click', closeModal);
  popup.appendChild(closeBtn);

  popupOverlay.appendChild(popup);
  document.body.appendChild(popupOverlay);
  createConfetti(popupOverlay);

  popupOverlay.addEventListener('click', (e) => {
    if (e.target === popupOverlay) closeModal();
  });
}

export function revealWinner(order, targetIndex) {
  if (_suppressedReveals > 0) {
    _suppressedReveals--;
    return;
  }
  const winner = order[targetIndex];
  showWinnerPopup(winner.name, winner.avatarUrl);
}
