# ai-decide

A tiny picker for when you can't decide. Type a list of names, hit **Spin the
Wheel**, and one of the animated contraptions (a wheel, a tarot spread, an
Oscars envelope, an Among Us airlock…) picks one for you.

## Use it

Serve the folder over HTTP and open `index.html`. Pickers are ES modules under
`js/pickers/` and load on demand — a static server is required (`python3 -m
http.server` is enough). `file://` will not load modules in most browsers.

## Layout

- `index.html` — page chrome and styles
- `js/core.js` — overlay, avatars, winner modal
- `js/manifest.js` — picker catalog + dynamic `import()`
- `js/app.js` — controls, URL params, spin
- `js/pickers/*.js` — one module per animation (`export function show(order, targetIndex)`)

## URL parameters

| Param | Example | What it does |
|---|---|---|
| `c1`, `c2`, … | `?c1=ada&c2=linus&c3=grace` | One name per slot (wheeldecide-style). |
| `names` | `?names=ada,linus,grace` | Same idea, comma-separated. |
| `time` | `?time=5` | Spin duration in seconds (0.8–8). |
| `picker` | `?picker=wheel` | Pre-select an animation (`wheel`, `dice`, `lotto`, `slot`, `plinko`, `roulette`, `horses`, `fortune`, `f1`, `hack`, `lightning`, `domino`, `sortinghat`, `torch`, `squidgame`, `capybara`, `tarot`, `claw`, `hotpotato`, `blackjack`, `magic8`, `strongman`, `upscale`, `actionfigure`, `brainrot`, `odyssey`, `oscars`, `penalty`, `bachelor`, `sumo`, `pinata`, `captcha`, `jenga`, `amongus`, or `random`). |

Example: `index.html?c1=ada&c2=linus&c3=grace&time=4&picker=bachelor`.

## Keyboard

- `Space` / `Enter` — spin
- `Esc` — cancel an in-flight animation

## Hosting

Drop the folder into GitHub Pages, Netlify, S3, anywhere that serves static
files.
