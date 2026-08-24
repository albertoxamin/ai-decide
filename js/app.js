import { CONFIG, generateAvatar, buildPeople, dismissActiveOverlays } from './core.js';
import { PICKER_MANIFEST, loadPicker, preloadPicker } from './manifest.js';

const $names = document.getElementById('names');
const $picker = document.getElementById('picker');
const $time = document.getElementById('time');
const $spin = document.getElementById('spin');
const $share = document.getElementById('share');
const $preview = document.getElementById('preview');

const randomOpt = document.createElement('option');
randomOpt.value = 'random';
randomOpt.textContent = '\uD83C\uDFB2 Random';
$picker.appendChild(randomOpt);
PICKER_MANIFEST.forEach((p) => {
  const opt = document.createElement('option');
  opt.value = p.id;
  opt.textContent = p.label;
  $picker.appendChild(opt);
});

function parseNamesFromText(text) {
  return String(text || '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function currentNames() {
  return parseNamesFromText($names.value);
}

function renderPreview() {
  $preview.innerHTML = '';
  currentNames().forEach((n) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    const img = document.createElement('img');
    img.src = generateAvatar(n);
    img.alt = '';
    const span = document.createElement('span');
    span.textContent = n;
    chip.appendChild(img);
    chip.appendChild(span);
    $preview.appendChild(chip);
  });
}

function readNamesFromQuery() {
  const params = new URLSearchParams(location.search);

  const cParams = [];
  for (const [key, value] of params.entries()) {
    const m = key.match(/^c(\d+)$/i);
    if (m) cParams.push({ n: parseInt(m[1], 10), value });
  }
  cParams.sort((a, b) => a.n - b.n);
  let names = cParams.map((c) => c.value);

  if (names.length === 0 && params.has('names')) {
    names = parseNamesFromText(params.get('names'));
  }

  if (params.has('time')) {
    const t = parseFloat(params.get('time'));
    if (Number.isFinite(t)) {
      const clamped = Math.max(0.8, Math.min(8, t));
      $time.value = String(clamped);
      CONFIG.spinDuration = Math.round(clamped * 1000);
    }
  }

  if (params.has('picker')) {
    const id = params.get('picker');
    const valid = id === 'random' || PICKER_MANIFEST.some((p) => p.id === id);
    if (valid) $picker.value = id;
  }

  if (names.length > 0) {
    $names.value = names.join('\n');
  }
}

function applyTimeFromInput() {
  const t = parseFloat($time.value);
  if (Number.isFinite(t)) {
    const clamped = Math.max(0.8, Math.min(8, t));
    CONFIG.spinDuration = Math.round(clamped * 1000);
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

function copyShareableUrl() {
  const names = currentNames();
  if (names.length === 0) {
    showToast('Add some names first');
    return;
  }
  const params = new URLSearchParams();
  names.forEach((n, i) => params.set('c' + (i + 1), n));
  if ($picker.value && $picker.value !== 'random') {
    params.set('picker', $picker.value);
  }
  const t = parseFloat($time.value);
  if (Number.isFinite(t) && Math.abs(t - 3) > 0.01) {
    params.set('time', String(t));
  }
  const url = location.origin + location.pathname + '?' + params.toString();
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (_) {
      /* ignore */
    }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(
      () => showToast('Link copied'),
      () => {
        fallback();
        showToast('Link copied');
      }
    );
  } else {
    fallback();
    showToast('Link copied');
  }
}

async function spin() {
  applyTimeFromInput();
  const people = buildPeople(currentNames());
  if (people.length < 2) {
    showToast('Add at least 2 names');
    return;
  }
  if (document.querySelector('[data-standup-overlay]')) {
    return;
  }
  const targetIndex = Math.floor(Math.random() * people.length);
  let id = $picker.value || 'random';
  if (id === 'random') {
    id = PICKER_MANIFEST[Math.floor(Math.random() * PICKER_MANIFEST.length)].id;
  }
  try {
    const mod = await loadPicker(id);
    mod.show(people, targetIndex);
  } catch (err) {
    console.error(err);
    showToast('Could not load picker');
  }
}

$names.addEventListener('input', renderPreview);
$time.addEventListener('change', applyTimeFromInput);
$spin.addEventListener('click', spin);
$share.addEventListener('click', copyShareableUrl);
$picker.addEventListener('change', () => preloadPicker($picker.value));

document.addEventListener('keydown', (e) => {
  const ae = document.activeElement;
  const tag = (ae && ae.tagName ? ae.tagName : '').toLowerCase();
  const isTyping =
    tag === 'input' || tag === 'textarea' || tag === 'select' || (ae && ae.isContentEditable);
  if (e.ctrlKey || e.metaKey || e.altKey) return;

  const hasOverlay = !!document.querySelector('[data-standup-overlay]');
  if (e.key === 'Escape') {
    if (hasOverlay) {
      e.preventDefault();
      dismissActiveOverlays();
    }
    return;
  }
  if (e.key === ' ' || e.key === 'Enter') {
    if (isTyping) return;
    if (hasOverlay) return;
    e.preventDefault();
    spin();
  }
});

readNamesFromQuery();
renderPreview();
applyTimeFromInput();
preloadPicker($picker.value);
