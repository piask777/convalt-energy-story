import { describe, expect, it } from 'vitest'
import { chapters } from '../data'

describe('chapter data', () => {
  it('defines the four connected businesses in narrative order', () => {
    expect(chapters.map(({ id }) => id)).toEqual([
      'manufacturing',
      'generation',
      'data',
      'recycling',
    ])
  })

  it('provides complete, unique content for every chapter', () => {
    expect(new Set(chapters.map(({ id }) => id))).toHaveLength(chapters.length)

    for (const chapter of chapters) {
      expect(chapter).toEqual({
        id: expect.stringMatching(/^[a-z]+$/),
        kicker: expect.any(String),
        title: expect.any(String),
        word: expect.any(String),
        summary: expect.stringMatching(/\.$/),
        system: expect.any(String),
        role: expect.any(String),
      })
      expect(Object.values(chapter).every(Boolean)).toBe(true)
    }
  })
})
