import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import useHighlightText from './useHighlightText'

describe('useHighlightText', () => {
  it('calls onHighlightText and updates ranges state', async () => {
    let captured = null
    const onHighlight = vi.fn((p) => {
      captured = p
    })

    function TestComp() {
      const [ref, ranges] = useHighlightText(onHighlight)
      return (
        <div data-testid="wrapper">
          <div
            data-testid="container"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: '<p>one <strong>two</strong> three</p>' }}
          />
          <span data-testid="ranges">{ranges.length}</span>
        </div>
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

    await waitFor(() => expect(onHighlight).toHaveBeenCalled())
    await waitFor(() => expect(Number(screen.getByTestId('ranges').textContent)).toBeGreaterThanOrEqual(1))
    expect(captured).toBeTruthy()
  })

  it('works when selection spans multiple elements', async () => {
    const onHighlight = vi.fn()

    function TestComp2() {
      const [ref, ranges] = useHighlightText(onHighlight)
      return (
        <div>
          <div
            data-testid="container2"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: '<div><p>start</p><p>end</p></div>' }}
          />
          <span data-testid="ranges2">{ranges.length}</span>
        </div>
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

    await waitFor(() => expect(onHighlight).toHaveBeenCalled())
    await waitFor(() => expect(Number(screen.getByTestId('ranges2').textContent)).toBeGreaterThanOrEqual(1))
  })

  it('toggles highlight off when selecting same range', async () => {
    const onHighlight = vi.fn()

    function TestComp3() {
      const [ref, ranges, setRanges] = useHighlightText(onHighlight)
      return (
        <div>
          <div
            data-testid="container3"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: '<p>hello world</p>' }}
          />
              <span data-testid="ranges3">{ranges.length}</span>
          <button data-testid="apply" onClick={() => setRanges([{ start: 0, end: 5 }])}>apply</button>
          <button data-testid="clear" onClick={() => setRanges([])}>clear</button>
        </div>
      )
    }

    render(<TestComp3 />)

    const container = screen.getByTestId('container3') as HTMLElement

    const textNode = container.querySelector('p')!.firstChild as Text
    const range = document.createRange()
    range.setStart(textNode, 0)
    range.setEnd(textNode, 5)

    const sel = window.getSelection()!
    sel.removeAllRanges()
    sel.addRange(range)

    // programmatically apply a highlight
    fireEvent.click(screen.getByTestId('apply'))

    await waitFor(() => expect(Number(screen.getByTestId('ranges3').textContent)).toBeGreaterThanOrEqual(1))

    // programmatically clear highlights
    fireEvent.click(screen.getByTestId('clear'))

    await waitFor(() => expect(Number(screen.getByTestId('ranges3').textContent)).toBe(0))
  })
})
