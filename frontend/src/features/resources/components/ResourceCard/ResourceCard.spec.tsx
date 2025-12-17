import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResourceCard from './ResourceCard'
import type { Resource } from '../../types/resource'

describe('ResourceCard', () => {
  it('renders title and author and handles read and delete button clicks', () => {
    const resource: Resource = { id: '1', name: 'Test Article', type: 'document', source: { name: 'Jane Doe', url: '' }, createdAt: '', read: false }
    const onToggleRead = vi.fn()
    const onDelete = vi.fn()

    render(<ResourceCard article={resource} onToggleRead={onToggleRead} onDelete={onDelete} />)

    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(screen.getByText(/By Jane Doe/i)).toBeInTheDocument()

    const readBtn = screen.getByText('Mark as Read')
    fireEvent.click(readBtn)
    expect(onToggleRead).toHaveBeenCalledWith('1')

    const deleteBtn = screen.getByText('Delete')
    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledWith('1')
  })
})
