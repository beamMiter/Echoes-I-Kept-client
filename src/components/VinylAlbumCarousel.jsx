import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const COVER_TRANSITION_MS = 360

// The overlay SVG shares the container's 7:5 box, so these are in the same
// coordinate space as the record: its centre sits at (462, 250) with a radius
// of 238, which is what puts the pivot just clear of the top-right edge and
// the needle down on the outer groove.
const ARM_PIVOT = { x: 640, y: 70 }
const ARM_NEEDLE = { x: 662, y: 240 }
// Negative swings the needle outward, off the record — positive would drag it
// toward the spindle.
const ARM_LIFTED_DEG = -16

function VinylAlbumCarousel({ tracks }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousTrack, setPreviousTrack] = useState(null)
  const [loadedCoverImage, setLoadedCoverImage] = useState(null)
  // `tracks` can be replaced with a shorter, real-data list after the initial
  // (mock-seeded) render — clamp so a stale index from before that swap never
  // reads past the new array's end.
  const activeTrack = tracks[activeIndex] ?? tracks[0]
  const coverLoaded = loadedCoverImage === activeTrack.image
  const stageRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          motionOk: '(prefers-reduced-motion: no-preference)',
          motionReduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          // The arm is authored in the playing position, so reduced motion
          // (and a failed JS load) just leaves it resting on the record.
          if (context.conditions.motionReduced) return

          const svgOrigin = `${ARM_PIVOT.x} ${ARM_PIVOT.y}`

          // Lift, then set back down — the same gesture whether this is the
          // first render or a track change, which is exactly what swapping a
          // record looks like.
          gsap
            .timeline()
            .to('[data-tonearm]', {
              rotate: ARM_LIFTED_DEG,
              duration: 0.35,
              ease: 'power2.out',
              svgOrigin,
            })
            .to(
              '[data-tonearm]',
              {
                rotate: 0,
                duration: 0.75,
                ease: 'power2.inOut',
                svgOrigin,
              },
              '+=0.1',
            )
        },
      )
    },
    { dependencies: [activeTrack.id], scope: stageRef },
  )

  useEffect(() => {
    if (!previousTrack) return undefined

    const timeoutId = window.setTimeout(
      () => setPreviousTrack(null),
      COVER_TRANSITION_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [activeTrack.id, previousTrack])

  const selectTrack = (nextIndex) => {
    if (nextIndex === activeIndex) return

    setPreviousTrack(activeTrack)
    setActiveIndex(nextIndex)
  }

  const selectNextTrack = () => {
    selectTrack((activeIndex + 1) % tracks.length)
  }

  return (
    <div className="w-full max-w-[520px]">
      <div ref={stageRef} className="relative aspect-[7/5] w-full">
        <div className="absolute left-[32%] top-1/2 z-0 aspect-square w-[68%] -translate-y-1/2">
          <div
            className="vinyl-record vinyl-spin relative h-full w-full rounded-full shadow-[0_16px_28px_rgba(0,0,0,0.28)]"
            aria-hidden="true"
          >
            <div className="absolute left-1/2 top-1/2 aspect-square w-[31%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-2 border-black/60 bg-neutral-800">
              <img
                src={activeTrack.image}
                alt=""
                draggable={false}
                className={`pointer-events-none h-full w-full select-none object-cover transition-opacity duration-300 ${
                  coverLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eeeae2] shadow-[0_0_0_2px_rgba(0,0,0,0.7)]" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={selectNextTrack}
          aria-label={`Show next song. Currently showing ${activeTrack.bestPick} by ${activeTrack.artist}`}
          className="group absolute -left-[4%] top-1/2 z-10 aspect-square w-[72%] -translate-y-1/2 overflow-hidden rounded-[4px] text-left shadow-[0_14px_30px_rgba(0,0,0,0.22)] outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-4"
        >
          {!coverLoaded && (
            <div
              className="absolute inset-0 z-10 animate-pulse bg-[#DAD6D1]"
              aria-hidden="true"
            />
          )}
          {previousTrack && (
            <img
              src={previousTrack.image}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none absolute inset-0 z-10 h-full w-full scale-[1.02] select-none object-cover"
            />
          )}
          <img
            key={activeTrack.id}
            src={activeTrack.image}
            alt={`${activeTrack.artist} album artwork for ${activeTrack.bestPick}`}
            draggable={false}
            className="album-cover-in pointer-events-none absolute inset-0 z-20 h-full w-full scale-[1.02] select-none object-cover transition-transform duration-300 group-hover:scale-[1.035] motion-reduce:transition-none"
            onLoad={() => setLoadedCoverImage(activeTrack.image)}
            onError={() => setLoadedCoverImage(activeTrack.image)}
          />
        </button>

        {/* Sits above the record but to the right of the album cover, so it
            never overlaps the clickable artwork. overflow-visible lets the arm
            swing past the box edge when it lifts. */}
        <svg
          viewBox="0 0 700 500"
          className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <g data-tonearm>
            <line
              x1={ARM_PIVOT.x}
              y1={ARM_PIVOT.y}
              x2={ARM_NEEDLE.x}
              y2={ARM_NEEDLE.y}
              stroke="#33312E"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <rect
              x={ARM_NEEDLE.x - 15}
              y={ARM_NEEDLE.y - 6}
              width="30"
              height="18"
              rx="4"
              fill="#33312E"
              transform={`rotate(7 ${ARM_NEEDLE.x} ${ARM_NEEDLE.y})`}
            />
            {/* Counterweight on the far side of the pivot. */}
            <circle cx={ARM_PIVOT.x - 4} cy={ARM_PIVOT.y - 26} r="14" fill="#4A4741" />
          </g>
          {/* Bearing housing stays put while the arm turns inside it. */}
          <circle
            cx={ARM_PIVOT.x}
            cy={ARM_PIVOT.y}
            r="17"
            fill="#D9D5CF"
            stroke="#33312E"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="mt-5 min-h-[112px] text-center" aria-live="polite">
        <p className="text-[13px] font-medium uppercase text-muted-foreground">
          {activeTrack.artist}
        </p>
        <p className="mt-1 text-lg font-semibold leading-7">
          {activeTrack.bestPick}
        </p>

        <a
          href={activeTrack.spotifyUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2"
          aria-label={`Listen to ${activeTrack.bestPick} by ${activeTrack.artist} on Spotify`}
        >
          Listen on Spotify
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>

        <div className="mt-1 flex items-center justify-center" aria-label="Choose a song">
          {tracks.map((track, index) => {
            const isActive = index === activeIndex

            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(index)}
                aria-label={`Show ${track.bestPick} by ${track.artist}`}
                aria-current={isActive ? 'true' : undefined}
                className="flex h-6 w-6 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-1"
              >
                <span
                  className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                    isActive ? 'w-4 bg-foreground' : 'w-1.5 bg-neutral-300'
                  }`}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VinylAlbumCarousel
