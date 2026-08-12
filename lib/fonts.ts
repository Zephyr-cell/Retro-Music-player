import { Teko, Manrope } from "next/font/google";

// Teko: condensed, bold, all-caps-friendly — the same register as the
// destination board on the bus in the reference photo. Reserved for the
// clock and the track title so it stays a signature, not a body face.
export const teko = Teko({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
});
