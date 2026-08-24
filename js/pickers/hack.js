import { CONFIG, createPickerOverlay, revealWinner } from '../core.js';

export const id = 'hack';
export const label = 'Hack terminal';

export function show(order, targetIndex) {
    const overlay = createPickerOverlay();
    const winner = order[targetIndex];

    const term = document.createElement('div');
    term.style.cssText =
      'background:#000;border:2px solid #0f0;border-radius:8px;padding:18px 22px;width:600px;height:380px;' +
      'font-family:"SF Mono",Menlo,Consolas,monospace;color:#0f0;font-size:13px;line-height:1.5;' +
      'box-shadow:0 0 30px rgba(0,255,0,0.3),inset 0 0 30px rgba(0,255,0,0.08);overflow:hidden;text-align:left;';

    const lines = [
      '> initializing standup_picker.exe ...',
      '> ACCESSING PERSONNEL DATABASE [############]',
      '> AUTH BYPASS ............................. OK',
      `> ${order.length} candidates loaded into buffer`,
      '> querying brain trust ........... OK',
      '> filtering by vibe="standup-ready"',
      '> sorting by chaotic_neutral_index DESC',
      '> running optimization heuristic ...',
      '> >>> [ACCESS GRANTED] <<<',
      '',
      `> >>> SPEAKER: ${winner.name}`,
    ];

    const pre = document.createElement('pre');
    pre.style.cssText = 'margin:0;font-family:inherit;color:inherit;white-space:pre-wrap;word-break:break-word;';
    term.appendChild(pre);

    const cursor = document.createElement('span');
    cursor.textContent = '\u258B';
    const cursorAnim = `hackBlink_${Date.now()}`;
    cursor.style.cssText = `animation:${cursorAnim} 0.8s steps(2) infinite;color:#0f0;`;

    overlay.appendChild(term);
    document.body.appendChild(overlay);

    const styleEl = document.createElement('style');
    styleEl.textContent = `@keyframes ${cursorAnim} { 0%,100% { opacity: 1; } 50% { opacity: 0; } }`;
    document.head.appendChild(styleEl);

    let acc = '';
    const totalDelay = CONFIG.spinDuration - 400;
    const perLine = totalDelay / lines.length;
    lines.forEach((line, i) => {
      setTimeout(() => {
        acc += line + '\n';
        pre.textContent = acc;
        pre.appendChild(cursor);
      }, 100 + i * perLine);
    });

    setTimeout(() => {
      overlay.remove();
      styleEl.remove();
      revealWinner(order, targetIndex);
    }, CONFIG.spinDuration + 100);
  }

  /** Lightning strike: dim stormy background, avatars in a row, a couple of warning flashes,
   *  then a big lightning bolt zaps the winner with a yellow electrical glow. */
