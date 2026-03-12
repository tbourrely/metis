import { describe, it, expect } from 'vitest'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import useHighlightText from './useHighlightText'
import userEvent from '@testing-library/user-event'
import { useRef } from 'react'

describe('useHighlightText', () => {
  it('calls onHighlightText and updates ranges state', async () => {
    function TestComp() {
      const ref = useRef(null)
      const [ranges] = useHighlightText(ref)
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
    await userEvent.pointer([{ keys: '[MouseLeft>]', target: container, offset: 4 }, { offset: 7 }, { keys: '[/MouseLeft]' }])
    await waitFor(() => expect(Number(screen.getByTestId('ranges').textContent)).toBe(1))
  })

  it('works when selection spans multiple elements', async () => {
    function TestComp2() {
      const ref = useRef(null)
      const [ranges] = useHighlightText(ref)
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
    await userEvent.pointer([{ keys: '[MouseLeft>]', target: container, offset: 0 }, { offset: 5 }, { keys: '[/MouseLeft]' }])
    await waitFor(() => expect(Number(screen.getByTestId('ranges2').textContent)).toBe(1))
  })

  it('toggles highlight off when selecting same range', async () => {
    function TestComp3() {
      const ref = useRef(null)
      const [ranges] = useHighlightText(ref)
      return (
        <div>
          <div
            data-testid="container3"
            ref={ref}
            dangerouslySetInnerHTML={{ __html: '<p>hello world</p>' }}
          />
          <span data-testid="ranges3">{ranges.length}</span>
        </div>
      )
    }

    render(<TestComp3 />)

    await userEvent.pointer([{ keys: '[MouseLeft>]', target: screen.getByTestId('container3'), offset: 0 }, { offset: 5 }, { keys: '[/MouseLeft]' }])
    await waitFor(() => expect(Number(screen.getByTestId('ranges3').textContent)).toBe(1))
    await userEvent.pointer([{ keys: '[MouseLeft>]', target: screen.getByTestId('container3'), offset: 0 }, { offset: 5 }, { keys: '[/MouseLeft]' }])
    await waitFor(() => expect(Number(screen.getByTestId('ranges3').textContent)).toBe(0))
  })

  it('does not allow partial overlapping highlights', async () => {
    const element = document.createElement('div')
    element.innerHTML = ` <ul><li>First item</li><li>Second item</li><li>Third item</li></ul>`
    document.body.appendChild(element)

    const { result } = renderHook(() => {
      const ref = { current: element }
      return useHighlightText(ref)
    })

    console.log(result.current)

    await userEvent.pointer([{ keys: '[MouseLeft>]', target: element, offset: 0 }, { offset: 5 }, { keys: '[/MouseLeft]' }])

    console.log(result.current)
  })
})
