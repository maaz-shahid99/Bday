# Birthday site

Five pages. Each one is locked behind a game that pretends to be hard and then folds.

## Make it hers

Everything you need to change lives in the top block of `assets/app.js`:

- `name` — used in the hero, the balloon letters, and the quiz answer
- `birthday` — the countdown target
- `song` — put an mp3 at `assets/song.mp3`
- `photos` — add images to `assets/`, one line each with a caption
- `notes` — what her friends wrote

Add the photos and the song to `assets/` with matching filenames. Nothing else needs touching.

## Run it

Open `index.html` in a browser. That's it — no build step.

## The gates

1. **Candles** — two relight once, the last one relights three times.
2. **Memory** — six pairs. After three misses the cards stop hiding; after five they match themselves.
3. **Balloons** — each holds a letter of her name. One dodges eight taps, then surrenders.
4. **Catch** — catch five presents. Every one you drop makes the basket wider and the fall slower.
5. **Unwrap** — scratch the paper off each photo. The last gift is wrapped twice.
6. **Quiz** — wrong answers shrink and flee, the right one grows.
7. **The lock** — four digits: her birthday, day then month. The hint gets blunter until it just tells her.
8. **The wall** — photos, notes, music, confetti. No game.

None of them can be lost. Stall on any of the newer three and a "let you through"
button appears after half a minute.

## Changing the running order

`GATES` at the top of `assets/app.js` is the running order, and the only place it
lives — gate numbering, the bunting, the "Next gate" links and the skip-ahead
guard all read from it. Reorder that list and the whole site follows. This does
mean a filename no longer tells you a gate's position: `gate2.html` is third.

## Locked until the day

Nothing opens before `birthday`. Until then the home page shows the countdown
and a dead "Locked until tomorrow" button, and any gate URL typed directly
bounces back home. It unlocks at local midnight on the day without needing a
reload — the countdown flips the button itself when it reaches zero.

To check the gates before then, add `?preview=1` to any URL. It sticks for the
rest of the browser tab, so the whole site can be walked through.

If `birthday` is unreadable, the site opens rather than locking her out.

Progress saves to her phone, so she can close it and come back.
The "Start over" button on the home page resets it.
