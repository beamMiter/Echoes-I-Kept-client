import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { NotebookPen } from 'lucide-react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

// Rendered as LatestArticles' `ctaSlot` — a row inside its shared
// rounded bg-[#EFEEEB] box, above the category tabs, separated by a
// divider — rather than its own section, so the homepage reads as one
// continuous block instead of two stacked cards.
//
// Shown to every visitor, logged in or not, admin or member. Logged-out
// visitors get sent through ProtectedRoute's normal /login redirect on
// click, same as any other protected link.
function WriteCta() {
  const containerRef = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(
        {
          motionOk: '(prefers-reduced-motion: no-preference)',
          motionReduced: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          // Everything here is decorative, so reduced-motion users just get
          // the finished state with nothing moving.
          if (context.conditions.motionReduced) {
            gsap.set('[data-cta-reveal]', { opacity: 1, y: 0 })
            return
          }

          const intro = gsap.timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 90%',
              once: true,
            },
          })

          intro.from('[data-cta-reveal]', {
            opacity: 0,
            y: 14,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.08,
          })

          // A slow sheen across the button on a long repeat delay, so it reads
          // as an occasional nudge rather than a blinking ad.
          intro.fromTo(
            '[data-cta-sheen]',
            { xPercent: -160 },
            {
              xPercent: 160,
              duration: 0.9,
              ease: 'power1.inOut',
              repeat: -1,
              repeatDelay: 5,
            },
            '+=0.6',
          )

          // Hover/focus handlers are wired up in here (rather than via
          // contextSafe at render time) so the tweens they create belong to
          // this context and get reverted with it.
          const button = containerRef.current.querySelector('[data-cta-button]')
          const icon = containerRef.current.querySelector('[data-cta-icon]')

          const activate = () => {
            gsap.to(button, { y: -2, duration: 0.25, ease: 'power2.out' })
            gsap.to(icon, {
              rotate: -18,
              x: -1,
              y: -1,
              duration: 0.3,
              ease: 'back.out(2.5)',
            })
          }

          const reset = () => {
            gsap.to(button, { y: 0, duration: 0.25, ease: 'power2.out' })
            gsap.to(icon, {
              rotate: 0,
              x: 0,
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            })
          }

          button.addEventListener('mouseenter', activate)
          button.addEventListener('mouseleave', reset)
          button.addEventListener('focus', activate)
          button.addEventListener('blur', reset)

          return () => {
            button.removeEventListener('mouseenter', activate)
            button.removeEventListener('mouseleave', reset)
            button.removeEventListener('focus', activate)
            button.removeEventListener('blur', reset)
          }
        },
      )
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className="mb-3 flex flex-col items-center justify-between gap-4 border-b border-[#D7D3CE] pb-3 text-center sm:flex-row sm:text-left"
    >
      <div>
        <h2
          data-cta-reveal
          className="text-base font-semibold leading-snug text-[#171717]"
        >
          Have a song and story of your own?
        </h2>
        <p data-cta-reveal className="mt-1 text-sm text-muted-foreground">
          Write about the artist you keep coming back to, and the one song that
          means the most.
        </p>
      </div>
      <Link
        data-cta-reveal
        data-cta-button
        to="/my-posts/new"
        className="relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-md bg-foreground px-6 py-2 text-sm font-medium text-white hover:bg-muted-foreground"
      >
        <span
          data-cta-sheen
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] bg-white/25 blur-[6px]"
        />
        <NotebookPen data-cta-icon className="h-4 w-4" aria-hidden="true" />
        Write a post
      </Link>
    </div>
  )
}

export default WriteCta
