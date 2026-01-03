import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import useHighlightText from './useHighlightText'
import userEvent from '@testing-library/user-event'

describe('useHighlightText', () => {
  it('calls onHighlightText and wraps the selection in a <mark>', async () => {
    let captured = null
    const onHighlight = vi.fn((p) => {
      captured = p
    })

    function TestComp() {
      const [ref] = useHighlightText(onHighlight)
      return (
        <div
          data-testid="container"
          ref={ref}
          dangerouslySetInnerHTML={{ __html: '<p>one <strong>two</strong> three</p>' }}
        />
      )
    }

    render(<TestComp />)
    const container = screen.getByTestId('container') as HTMLElement

    const strong = container.querySelector('strong')!
    const textNode = strong.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, textNode.textContent ? textNode.textContent.length : 0)

    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    fireEvent.pointerUp(container)

    expect(onHighlight).toHaveBeenCalled()
    expect(captured).toBeTruthy()
    const marks = container.querySelectorAll('mark')
    expect(marks.length).toBeGreaterThanOrEqual(1)
  })

  it('works when selection spans multiple elements', async () => {
    const onHighlight = vi.fn()

    function TestComp2() {
      const [ref] = useHighlightText(onHighlight)
      return (
        <div
          data-testid="container2"
          ref={ref}
          dangerouslySetInnerHTML={{ __html: '<div><p>start</p><p>end</p></div>' }}
        />
      )
    }

    render(<TestComp2 />)
    const container = screen.getByTestId('container2') as HTMLElement

    const p = container.querySelectorAll('p')!
    const startNode = p[0].childNodes[0] as Text
    const endNode = p[1].childNodes[0] as Text
    const range = document.createRange()
    range.setStart(startNode, 0)
    range.setEnd(endNode, endNode.textContent.length)

    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    fireEvent.pointerUp(container)

    expect(onHighlight).toHaveBeenCalled()
    const marks = container.querySelectorAll('mark')
    expect(marks.length).toBeGreaterThanOrEqual(2)
    const texts = Array.from(marks).map((m) => m.textContent || '')
    expect(texts.some((t) => t.includes('start'))).toBe(true)
    expect(texts.some((t) => t.includes('end'))).toBe(true)
  })

  it('toggles highlight off when selecting same range', async () => {
    const onHighlight = vi.fn()

    function TestComp3() {
      const [ref] = useHighlightText(onHighlight)
      return (
        <div>
          <div
            data-testid="container3"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: '<p>hello world</p>' }}
          />
        </div>
      )
    }

    render(<TestComp3 />)

    const container = screen.getByTestId('container3') as HTMLElement

    await userEvent.pointer([{ target: container, offset: 0, keys: '[MouseLeft>]' }, { offset: 5 }, { keys: '[/MouseLeft]' }])

    expect(container.querySelectorAll('mark').length).toBe(1)

    await userEvent.pointer([{ target: container, offset: 0, keys: '[MouseLeft>]' }, { offset: 5 }, { keys: '[/MouseLeft]' }])

    expect(container.querySelectorAll('mark').length).toBe(0)
  })
})
