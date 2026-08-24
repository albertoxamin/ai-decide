/** Picker catalog. Modules are loaded on demand via dynamic import(). */

export const PICKER_MANIFEST = [
  { id: 'wheel', label: 'Wheel', src: './pickers/wheel.js' },
  { id: 'dice', label: 'Dice', src: './pickers/dice.js' },
  { id: 'lotto', label: 'Lotto', src: './pickers/lotto.js' },
  { id: 'slot', label: 'Slot machine', src: './pickers/slot.js' },
  { id: 'plinko', label: 'Plinko', src: './pickers/plinko.js' },
  { id: 'roulette', label: 'Russian roulette', src: './pickers/roulette.js' },
  { id: 'horses', label: 'Horse race', src: './pickers/horses.js' },
  { id: 'fortune', label: 'Fortune cookie', src: './pickers/fortune.js' },
  { id: 'f1', label: 'F1 race', src: './pickers/f1.js' },
  { id: 'hack', label: 'Hack terminal', src: './pickers/hack.js' },
  { id: 'lightning', label: 'Lightning', src: './pickers/lightning.js' },
  { id: 'domino', label: 'Domino chain', src: './pickers/domino.js' },
  { id: 'sortinghat', label: 'Sorting hat', src: './pickers/sortinghat.js' },
  { id: 'torch', label: 'Torch snuff', src: './pickers/torch.js' },
  { id: 'squidgame', label: 'Squid Game', src: './pickers/squidgame.js' },
  { id: 'capybara', label: 'Capybara tub', src: './pickers/capybara.js' },
  { id: 'tarot', label: 'Tarot reveal', src: './pickers/tarot.js' },
  { id: 'claw', label: 'Claw machine', src: './pickers/claw.js' },
  { id: 'hotpotato', label: 'Hot potato', src: './pickers/hotpotato.js' },
  { id: 'blackjack', label: 'Blackjack table', src: './pickers/blackjack.js' },
  { id: 'magic8', label: 'Magic 8-Ball', src: './pickers/magic8.js' },
  { id: 'strongman', label: 'High Striker', src: './pickers/strongman.js' },
  { id: 'upscale', label: 'AI Upscale (144p\u21924K)', src: './pickers/upscale.js' },
  { id: 'actionfigure', label: 'AI Action Figure', src: './pickers/actionfigure.js' },
  { id: 'brainrot', label: 'Italian Brain Rot', src: './pickers/brainrot.js' },
  { id: 'odyssey', label: 'Challenge of the Bow', src: './pickers/odyssey.js' },
  { id: 'oscars', label: 'Oscars envelope', src: './pickers/oscars.js' },
  { id: 'penalty', label: 'Penalty shootout', src: './pickers/penalty.js' },
  { id: 'bachelor', label: 'Bachelor rose', src: './pickers/bachelor.js' },
  { id: 'sumo', label: 'Sumo', src: './pickers/sumo.js' },
  { id: 'pinata', label: 'Pi\u00f1ata', src: './pickers/pinata.js' },
  { id: 'captcha', label: 'Captcha', src: './pickers/captcha.js' },
  { id: 'jenga', label: 'Jenga', src: './pickers/jenga.js' },
  { id: 'amongus', label: 'Among Us eject', src: './pickers/amongus.js' },
];

const _cache = new Map();

export function loadPicker(id) {
  const entry = PICKER_MANIFEST.find((p) => p.id === id);
  if (!entry) return Promise.reject(new Error('Unknown picker: ' + id));
  if (!_cache.has(id)) {
    _cache.set(id, import(entry.src));
  }
  return _cache.get(id);
}

export function preloadPicker(id) {
  if (id && id !== 'random') loadPicker(id).catch(() => {});
}
