"use client";

/*
  DEVIATION FROM SPEC, FLAGGED FOR YOU:
  The spec asked for two fully separate DOM blocks (`hidden sm:flex` /
  `sm:hidden`) for desktop vs. mobile. I've kept that for everything EXCEPT
  the YouTube mount itself, which appears once in the DOM and is repositioned
  by CSS (`sm:contents`) rather than duplicated.

  Reason: the YT IFrame API replaces a single element with a live iframe. Two
  copies of that element would mean two simultaneous embedded players (double
  network + audio), and putting the "inactive" breakpoint's copy in a
  `display:none` container is the same shape as the hidden/1px-container
  pattern the spec explicitly said to avoid. One mount, moved by CSS, avoids
  both problems. Title, seek bar, and transport ARE duplicated per breakpoint
  as asked, since those are cheap.

  If you'd rather I mount two independent players and destroy/recreate one on
  breakpoint change, say so and I'll switch to that instead.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import type { Playlist, Track } from "@/lib/tracks";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type PlaybackState = "unstarted" | "playing" | "paused" | "ended" | "buffering" | "cued";

function formatTime(totalSeconds: number) {
  const seconds = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

// ---- Icons (module scope) --------------------------------------------

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-[1px]">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M6 5h2v14H6zM20 5v14l-11-7z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16 5h2v14h-2zM4 5v14l11-7z" />
    </svg>
  );
}

// ---- Sub-components (module scope — see header comment in app/page.tsx) ---

function VinylArt({
  mountId,
  isPlaying,
}: {
  mountId: string;
  isPlaying: boolean;
}) {
  return (
    <div className="relative h-16 w-16 shrink-0 self-start overflow-hidden rounded-full ring-1 ring-white/15 sm:h-20 sm:w-20">
      {/*
        The iframe fills this box height-first and overflows sideways, so it
        center-crops instead of letterboxing. The animation is always
        mounted; only animationPlayState toggles, so pausing/resuming never
        resets rotation to 0deg (that only happens on remount).
      */}
      <div
        id={mountId}
        className="vinyl-spin absolute left-1/2 top-1/2 aspect-video h-full w-auto min-w-full -translate-x-1/2 -translate-y-1/2 [&>iframe]:h-full [&>iframe]:w-full"
        style={{ animationPlayState: isPlaying ? "running" : "paused" }}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/70 ring-2 ring-white/40" />
    </div>
  );
}

function SeekBar({
  elapsed,
  duration,
  onSeek,
}: {
  elapsed: number;
  duration: number;
  onSeek: (fraction: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fraction = duration > 0 ? Math.min(1, elapsed / duration) : 0;

  // Pointer events (not click) so this also works as a drag, and touch-none
  // so dragging the bar doesn't scroll the page underneath it.
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const apply = (clientX: number) => {
      const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(f);
    };
    apply(e.clientX);
    el.setPointerCapture(e.pointerId);

    const handleMove = (ev: PointerEvent) => apply(ev.clientX);
    const handleUp = () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerup", handleUp);
    };
    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerup", handleUp);
  }

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      className="group relative h-6 w-full touch-none cursor-pointer"
    >
      <div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full bg-white/15">
        <div
          className="h-full rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)]"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
        style={{ left: `${fraction * 100}%` }}
      />
    </div>
  );
}

function TransportControls({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  large = false,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  large?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous track"
        className="grid h-11 w-11 place-items-center text-white/80 hover:text-white"
      >
        <PrevIcon />
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={`grid place-items-center rounded-full bg-gradient-to-b from-amber to-amber-dim text-ink ring-1 ring-white/25 shadow-[0_6px_20px_-4px_var(--color-amber)] ${
          large ? "h-[52px] w-[52px]" : "h-9 w-9"
        }`}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next track"
        className="grid h-11 w-11 place-items-center text-white/80 hover:text-white"
      >
        <NextIcon />
      </button>
    </div>
  );
}

function PlaylistTabs({
  playlists,
  activeIndex,
  onSelect,
}: {
  playlists: Playlist[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-3 flex justify-center gap-2">
      {playlists.map((p, i) => (
        <button
          key={p.name}
          type="button"
          onClick={() => onSelect(i)}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${
            i === activeIndex ? "bg-white/20 text-white" : "text-white/50 hover:text-white/80"
          }`}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}

// ---- Player -----------------------------------------------------------

const MOUNT_ID = "yt-player-mount";

export default function Player({ playlists }: { playlists: Playlist[] }) {
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [state, setState] = useState<PlaybackState>("unstarted");
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);

  const ytRef = useRef<any>(null);
  const pollRef = useRef<number | null>(null);

  const playlist = playlists[playlistIndex];
  const track: Track = playlist.tracks[trackIndex];

  // Refs mirroring the latest playlist/track so the event handlers we hand
  // to the YT player once (at creation) always read current state, instead
  // of the stale playlistIndex/trackIndex they closed over at creation time.
  const playlistRef = useRef(playlist);
  const trackRef = useRef(track);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  useEffect(() => {
    trackRef.current = track;
  }, [track]);

  const goNext = useCallback(() => {
    setTrackIndex((i) => (i + 1) % playlistRef.current.tracks.length);
  }, []);
  const goPrev = useCallback(() => {
    setTrackIndex((i) => (i - 1 + playlistRef.current.tracks.length) % playlistRef.current.tracks.length);
  }, []);

  const handleStateChange = useCallback(
    (e: any) => {
      const YT = window.YT;
      if (e.data === YT.PlayerState.PLAYING) {
        setState("playing");
        setDuration(ytRef.current?.getDuration?.() ?? 0);
      } else if (e.data === YT.PlayerState.PAUSED) {
        setState("paused");
      } else if (e.data === YT.PlayerState.ENDED) {
        setState("ended");
        goNext();
      } else if (e.data === YT.PlayerState.BUFFERING) {
        setState("buffering");
      }
    },
    [goNext]
  );

  const handleError = useCallback(
    (e: any) => {
      // A video got pulled or embedding got switched off after we shipped.
      // Log it and move on instead of stalling the dial.
      if (typeof window !== "undefined" && typeof (window as any).va === "function") {
        (window as any).va("event", {
          name: "youtube_playback_error",
          code: e.data,
          videoId: trackRef.current.videoId,
        });
      }
      goNext();
    },
    [goNext]
  );

  // Load the IFrame API script once.
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      setApiReady(true);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // Create the player exactly once the API is ready.
  useEffect(() => {
    if (!apiReady || ytRef.current) return;
    ytRef.current = new window.YT.Player(MOUNT_ID, {
      videoId: trackRef.current.videoId,
      playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onStateChange: handleStateChange,
        onError: handleError,
      },
    });
  }, [apiReady, handleStateChange, handleError]);

  // Poll playback position — YouTube doesn't push timeupdate events.
  useEffect(() => {
    if (state === "playing") {
      pollRef.current = window.setInterval(() => {
        setElapsed(ytRef.current?.getCurrentTime?.() ?? 0);
      }, 250);
    } else if (pollRef.current) {
      window.clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [state]);

  // Load a new video whenever the current track changes.
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (!ytRef.current?.loadVideoById) return;
    ytRef.current.loadVideoById(track.videoId);
    setElapsed(0);
    setDuration(0);
  }, [track.videoId]);

  function togglePlay() {
    // No canplay gating here on purpose — iOS Safari won't fire canplay
    // before a user gesture, which would leave this button permanently dead.
    if (!ytRef.current) return;
    if (state === "playing") ytRef.current.pauseVideo();
    else ytRef.current.playVideo();
  }

  function switchPlaylist(index: number) {
    setPlaylistIndex(index);
    setTrackIndex(0);
  }

  function seekTo(fraction: number) {
    if (!ytRef.current || !duration) return;
    ytRef.current.seekTo(duration * fraction, true);
  }

  const isPlaying = state === "playing";

  return (
    <div>
      <div
        className={[
          "flex flex-col gap-3 rounded-[26px] p-4",
          "sm:flex-row sm:items-center sm:gap-4 sm:rounded-full sm:p-3 sm:pr-5",
          "border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055]",
          "backdrop-blur-3xl backdrop-saturate-[1.7]",
          "shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]",
        ].join(" ")}
      >
        {/* Row 1 (mobile) / vinyl + title column (desktop) */}
        <div className="flex items-center gap-3 sm:contents">
          <VinylArt mountId={MOUNT_ID} isPlaying={isPlaying} />
          <div className="min-w-0 sm:hidden">
            <p className="truncate text-[15px] font-semibold">{track.title}</p>
            <p className="truncate text-[12.5px] text-white/70">{track.artist}</p>
          </div>

          {/* Desktop-only middle column: title/artist + seek + times */}
          <div className="hidden min-w-0 flex-1 sm:flex sm:flex-col sm:gap-1">
            <p className="truncate text-[15px] font-semibold">{track.title}</p>
            <p className="truncate text-[12.5px] text-white/70">{track.artist}</p>
            <SeekBar elapsed={elapsed} duration={duration} onSeek={seekTo} />
            <div className="tabular flex justify-between text-[10.5px] text-white/60">
              <span>{formatTime(elapsed)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="hidden sm:block">
            <TransportControls isPlaying={isPlaying} onTogglePlay={togglePlay} onPrev={goPrev} onNext={goNext} />
          </div>
        </div>

        {/* Row 2 (mobile only): full-width seek bar */}
        <div className="sm:hidden">
          <SeekBar elapsed={elapsed} duration={duration} onSeek={seekTo} />
        </div>

        {/* Row 3 (mobile only): times + centered transport, 44px targets */}
        <div className="flex items-center justify-between sm:hidden">
          <div className="tabular flex gap-1 text-[10.5px] text-white/60">
            <span>{formatTime(elapsed)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <TransportControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onPrev={goPrev}
            onNext={goNext}
            large
          />
        </div>
      </div>

      <PlaylistTabs playlists={playlists} activeIndex={playlistIndex} onSelect={switchPlaylist} />
    </div>
  );
}
