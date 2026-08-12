# Nostalgia Radio — first draft

## Run it

```
npm install
npm run dev
```

## Before this is real, you need to fill in

1. **`public/bg/scene-tall.png`** — right now this is just a copy of the
   landscape photo you sent, so the build doesn't 404. Per your own spec it
   needs to be a *separately composed* portrait scene, not a crop. Swap it
   for a real one.
2. **`public/bg/scene-wide.png`** — currently the street-photo you uploaded.
   Replace if that was just a placeholder for me too.
3. **`lib/tracks.ts`** — every `videoId` is the placeholder string
   `"REPLACE_WITH_VIDEO_ID"` and every `duration` is `"0:00"`. I didn't
   search for or add any real YouTube IDs, per your spec — drop in the real
   ones. Also rename `"Unknown Artist"` (tracks 1–10) to whoever that artist
   actually is.
4. **`components/SocialLinks.tsx`** — the Instagram/YouTube links point at
   `#`. Point them at your real profiles.
5. **`components/ListenerCount.tsx`** — this is a fake random-walk number
   for now, not a real listener count. Wire it to a real source or drop it.

## One deliberate deviation from the spec

The desktop/mobile player is one DOM tree using responsive Tailwind classes,
not two fully duplicated blocks — because the spec's own anti-hiding rule
and the "two blocks" instruction pull in opposite directions for the one
element that can't be duplicated (the YouTube mount). Full reasoning is in
the comment at the top of `components/Player.tsx`. Say the word if you'd
rather I mount two independent players instead.

## Design choices worth knowing about

- **Palette**: pulled from the reference photo — Haryana Roadways blue/white
  and sun-bleached street gold — collapsed to a single amber accent
  (`#e8a33d`) so the play button, seek bar glow, and listener dot all read
  as one system.
- **Type**: Teko (condensed, the same register as the bus's destination
  board) for the clock and track title only; Manrope for everything else.
  Both load via `next/font/google`, so they need network access at build
  time.
- **Vinyl artwork**: the live YouTube iframe is center-cropped into the
  circle via CSS (height-first, overflow hidden) rather than a real object-fit
  crop, since `object-fit` on `<iframe>` isn't reliable cross-browser. It's a
  reasonable approximation for a first pass, not pixel-perfect.
