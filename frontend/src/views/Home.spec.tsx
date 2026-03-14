import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const navigateMock = vi.fn()
vi.mock('../routes', () => ({
  Route: {
    // page 2 of 3 so both Previous and Next are enabled
    useSearch: () => ({ page: 2, search: 'foo', hideRead: true }),
    useNavigate: () => navigateMock,
  },
}))

vi.mock('../features/resources/hooks/useResources', () => ({
  default: () => ({
    resources: [],
    handleDelete: vi.fn(),
    handleToggleRead: vi.fn(),
    reloadResources: vi.fn(),
    totalPages: 3,
    totalItems: 0,
  }),
}))

vi.mock('../components/Sidebar', () => ({ default: () => null }))
vi.mock('../features/resources/components/ResourcesGrid', () => ({ default: () => null }))
vi.mock('../features/resources/components/ResourcesHeader', () => ({ default: () => null }))

import Home from './Home'

describe('Home pagination', () => {
  beforeEach(() => navigateMock.mockClear())

  it('next page preserves hideRead and search params', () => {
    render(<Home />)

    fireEvent.click(screen.getByText('Next page'))

    expect(navigateMock).toHaveBeenCalledOnce()
    const searchFn = navigateMock.mock.calls[0][0].search
    const result = searchFn({ page: 2, search: 'foo', hideRead: true })
    expect(result).toEqual({ page: 3, search: 'foo', hideRead: true })
  })

  it('previous page preserves hideRead and search params', () => {
    render(<Home />)

    fireEvent.click(screen.getByText('Previous page'))

    expect(navigateMock).toHaveBeenCalledOnce()
    const searchFn = navigateMock.mock.calls[0][0].search
    const result = searchFn({ page: 2, search: 'foo', hideRead: true })
    expect(result).toEqual({ page: 1, search: 'foo', hideRead: true })
  })
})
