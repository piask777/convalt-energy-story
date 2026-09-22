import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { chapters } from '../data'

const sceneRender = vi.fn()

vi.mock('../components/EnergyScene', () => ({
  default: (props) => {
    sceneRender(props)
    return <button type="button" data-testid="scene-failure" onClick={props.onFailure}>Simulate scene failure</button>
  },
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  sceneRender.mockClear()
})

describe('accessible story content', () => {
  it('exposes every chapter and its navigation control', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    render(<App />)

    expect(screen.getByRole('link', { name: 'Skip to story' })).toHaveAttribute('href', '#story')
    expect(screen.getByRole('navigation', { name: 'Story chapters' })).toBeInTheDocument()

    for (const chapter of chapters) {
      const heading = screen.getByRole('heading', { name: chapter.title })
      const section = heading.closest('section')
      expect(section).toHaveAttribute('aria-labelledby', heading.id)
      expect(section).toHaveTextContent(chapter.summary)
      expect(screen.getByRole('button', { name: `Go to ${chapter.title}` })).toBeInTheDocument()
    }
  })
})

describe('lightweight fallback', () => {
  it('uses the fallback when WebGL is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    const { container } = render(<App />)

    expect(container.querySelector('.fallback-visual')).toBeInTheDocument()
    expect(sceneRender).not.toHaveBeenCalled()
  })

  it('keeps the 3D scene while disabling motion when reduced motion is preferred', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({})
    vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    const { container } = render(<App />)

    await screen.findByTestId('scene-failure')
    expect(container.querySelector('.fallback-visual')).not.toBeInTheDocument()
    expect(sceneRender).toHaveBeenCalledWith(expect.objectContaining({ reducedMotion: true }))
  })

  it('replaces the scene if its rendering context fails', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({})
    const { container } = render(<App />)

    fireEvent.click(await screen.findByTestId('scene-failure'))

    await waitFor(() => expect(container.querySelector('.fallback-visual')).toBeInTheDocument())
  })
})
