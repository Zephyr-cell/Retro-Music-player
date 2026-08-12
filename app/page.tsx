import Clock from "@/components/Clock";
import ListenerCount from "@/components/ListenerCount";
import SocialLinks from "@/components/SocialLinks";
import Player from "@/components/Player";
import { playlists } from "@/lib/tracks";

// Module scope, not nested in Home — see the Player.tsx header comment for
// why that matters (remount-on-every-render kills the vinyl spin).
function GrainOverlay() {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg'>" +
    "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter>" +
    "<rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,${svg}")`,
        mixBlendMode: "overlay",
        opacity: 0.3,
      }}
    />
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      <div className="hero-bg fixed inset-0 -z-20 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
      </div>

      <GrainOverlay />

      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-[max(1rem,env(safe-area-inset-left))] z-10">
        <Clock />
      </div>
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-1/2 z-10 -translate-x-1/2">
        <ListenerCount />
      </div>
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-10">
        <SocialLinks />
      </div>

      <div
        className="mt-auto w-full max-w-xl px-4"
        style={{ marginBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <Player playlists={playlists} />
      </div>
    </main>
  );
}
