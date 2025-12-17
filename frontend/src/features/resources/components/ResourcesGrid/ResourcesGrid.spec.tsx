import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResourcesGrid from './ResourcesGrid'
import type { Resource } from '../../types/resource'

describe('ResourcesGrid', () => {
  it('renders a grid of article cards and forwards handlers', () => {
    const articles: Resource[] = [
      { id: '1', name: 'A1', type: 'document', source: { name: 'A', url: '' }, createdAt: '', read: false },
      { id: '2', name: 'A2', type: 'document', source: { name: 'B', url: '' }, createdAt: '', read: false },
    ]
    const onToggleRead = vi.fn()
    const onDelete = vi.fn()
    render(<ResourcesGrid articles={articles} onToggleRead={onToggleRead} onDelete={onDelete} />)

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()

    const readButtons = screen.getAllByText('Mark as Read')
    fireEvent.click(readButtons[0])
    expect(onToggleRead).toHaveBeenCalledWith('1')

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
