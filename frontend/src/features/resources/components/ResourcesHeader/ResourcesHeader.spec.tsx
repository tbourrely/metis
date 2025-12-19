import { describe, it, expect, vi } from 'vitest'

// Mock the Route module used in the component to avoid needing a RouterProvider
const navigateMock = vi.fn()
vi.mock('../../../../routes', () => ({
  Route: {
    useSearch: () => ({ search: '', hideRead: false, page: 1 }),
    useNavigate: () => navigateMock,
  },
}))

import { render, screen, fireEvent } from '@testing-library/react'
import ResourcesHeader from './ResourcesHeader'

describe('ResourcesHeader', () => {
  it('renders title, hide-read toggle and search input and forwards handlers', () => {
    const onCreated = vi.fn()

    navigateMock.mockClear()
    render(<ResourcesHeader onCreated={onCreated} />)

    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Hide read resources')).toBeInTheDocument()

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(navigateMock).toHaveBeenCalled()

    const input = screen.getByPlaceholderText(/Search resources.../i) as HTMLInputElement
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(navigateMock).toHaveBeenCalled()
  })
})
