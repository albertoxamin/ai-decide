# ai-decide

A tiny single-page picker for when you can't decide. Type a list of names,
hit **Spin the Wheel**, and one of twenty animated contraptions (a wheel, a
slot machine, a hot potato, a sorting hat, a blackjack table…) picks one for
you.

## Use it

[**Open the page**](./index.html) — that's it. Single self-contained
`index.html`, no build step, no dependencies.

## URL parameters

The page reads its initial state from the query string, so you can deep-link
to a pre-loaded roster:

| Param | Example | What it does |
|---|---|---|
| `c1`, `c2`, … | `?c1=ada&c2=linus&c3=grace` | One name per slot (wheeldecide-style). |
| `names` | `?names=ada,linus,grace` | Same idea, comma-separated. |
| `time` | `?time=5` | Spin duration in seconds (0.8–8). |
| `picker` | `?picker=wheel` | Pre-select an animation (`wheel`, `dice`, `lotto`, `slot`, `plinko`, `roulette`, `horses`, `fortune`, `f1`, `hack`, `lightning`, `domino`, `sortinghat`, `torch`, `squidgame`, `capybara`, `tarot`, `claw`, `hotpotato`, `blackjack`, or `random`). |

Example: `index.html?c1=ada&c2=linus&c3=grace&time=4&picker=wheel`.

## Keyboard

- `Space` / `Enter` — spin
- `Esc` — cancel an in-flight animation

## Hosting

Drop the folder into GitHub Pages, Netlify, S3, anywhere that serves static
files. The page works fine over `file://` too.
