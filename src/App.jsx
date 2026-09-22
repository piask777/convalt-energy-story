import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { chapters } from './data'

const EnergyScene = lazy(() => import('./components/EnergyScene'))

const canRenderWebGL = () => {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function App() {
  const [active, setActive] = useState(0)
  const [journey, setJourney] = useState(0)
  const [sceneFailed, setSceneFailed] = useState(false)
  const [lightweight, setLightweight] = useState(() => !canRenderWebGL())
  const [compact, setCompact] = useState(() => matchMedia('(max-width: 760px)').matches)
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const sections = useRef([])

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const narrow = matchMedia('(max-width: 760px)')
    const updateMode = () => {
      setLightweight(!canRenderWebGL())
      setCompact(narrow.matches)
      setReducedMotion(reduced.matches)
    }
    updateMode()
    reduced.addEventListener('change', updateMode)
    narrow.addEventListener('change', updateMode)
    return () => {
      reduced.removeEventListener('change', updateMode)
      narrow.removeEventListener('change', updateMode)
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      setJourney(max > 0 ? scrollY / max : 0)
      const center = innerHeight * 0.5
      let closest = 0
      let distance = Infinity
      sections.current.forEach((section, index) => {
        if (!section) return
        const rect = section.getBoundingClientRect()
        const next = Math.abs(rect.top + rect.height / 2 - center)
        if (next < distance) {
          closest = index
          distance = next
        }
      })
      setActive(closest)
    }
    update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
    }
  }, [])

  const goTo = (index) => sections.current[index]?.scrollIntoView({ behavior: lightweight ? 'auto' : 'smooth' })

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input, textarea, select')) return
      const nextKeys = ['ArrowDown', 'ArrowRight', 'PageDown']
      const previousKeys = ['ArrowUp', 'ArrowLeft', 'PageUp']
      let target = null
      if (nextKeys.includes(event.key)) target = Math.min(active + 1, chapters.length - 1)
      if (previousKeys.includes(event.key)) target = Math.max(active - 1, 0)
      if (event.key === 'Home') target = 0
      if (event.key === 'End') target = chapters.length - 1
      if (target !== null) {
        event.preventDefault()
        sections.current[target]?.scrollIntoView({ behavior: lightweight ? 'auto' : 'smooth' })
      }
    }
    addEventListener('keydown', onKeyDown)
    return () => removeEventListener('keydown', onKeyDown)
  }, [active, lightweight])

  const fallback = lightweight || sceneFailed

  return (
    <div className="site-shell">
      <a className="skip-link" href="#story">Skip to story</a>
      <header className="site-header">
        <a className="wordmark" href="#story" aria-label="Convalt Energy, home">
          <span aria-hidden="true">C</span> CONVALT ENERGY
        </a>
        <p className="chapter-count"><span>{String(active + 1).padStart(2, '0')}</span> / 04</p>
      </header>

      <div className="scene-layer" aria-hidden="true">
        {fallback ? (
          <div className={`fallback-visual fallback-${active}`}>
            <span /><span /><span /><span /><i />
          </div>
        ) : (
          <Suspense fallback={<p className="scene-status">Initializing energy field</p>}>
            <EnergyScene chapter={active} progress={journey * (chapters.length - 1)} compact={compact} reducedMotion={reducedMotion} onFailure={() => setSceneFailed(true)} />
          </Suspense>
        )}
      </div>

      <nav className="chapter-nav" aria-label="Story chapters">
        {chapters.map((chapter, index) => (
          <button key={chapter.id} className={active === index ? 'is-active' : ''} onClick={() => goTo(index)} aria-label={`Go to ${chapter.title}`} aria-current={active === index ? 'step' : undefined}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <i />
          </button>
        ))}
      </nav>

      <main id="story">
        {chapters.map((chapter, index) => (
          <section id={chapter.id} className="chapter" key={chapter.id} ref={(node) => { sections.current[index] = node }} aria-labelledby={`${chapter.id}-title`}>
            <div className="chapter-copy">
              <p className="eyebrow"><span>{String(index + 1).padStart(2, '0')}</span> {chapter.kicker}</p>
              <h1 id={`${chapter.id}-title`}>{chapter.title}</h1>
              <p className="summary">{chapter.summary}</p>
              <dl>
                <div><dt>System</dt><dd>{chapter.system}</dd></div>
                <div><dt>Role</dt><dd>{chapter.role}</dd></div>
              </dl>
            </div>
            <p className="chapter-word" aria-hidden="true">{chapter.word}</p>
          </section>
        ))}
      </main>

      <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${journey})` }} /></div>
      <p className="key-hint">Use arrows to navigate</p>
    </div>
  )
}
