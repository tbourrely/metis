import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResourceCard from './ResourceCard'

describe('ArticleCard', () => {
  it('renders title and author and opens menu on button click', () => {
    const article = { id: '1', name: 'Test Article', type: 'document', source: { name: 'Jane Doe', url: '' }, createdAt: '' }
    const onMenuOpen = vi.fn()

    render(<ResourceCard article={article} onMenuOpen={onMenuOpen} />)

    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(screen.getByText(/By Jane Doe/i)).toBeInTheDocument()

    const btn = screen.getByText('⋯')
    fireEvent.click(btn)
    expect(onMenuOpen).toHaveBeenCalled()
    // ensure called with event and id
    expect(onMenuOpen.mock.calls[0][1]).toBe('1')
  })
})
