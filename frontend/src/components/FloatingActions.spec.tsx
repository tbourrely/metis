import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import FloatingActions from './FloatingActions'

describe('FloatingActions', () => {
  it('renders buttons and calls handlers', () => {
    const onToggleRead = vi.fn()
    const onDelete = vi.fn()

    render(<FloatingActions read={false} onToggleRead={onToggleRead} onDelete={onDelete} />)

    const readBtn = screen.getByTitle('Mark as read')
    const deleteBtn = screen.getByTitle('Delete')

    expect(readBtn).toBeInTheDocument()
    expect(deleteBtn).toBeInTheDocument()

    fireEvent.click(readBtn)
    expect(onToggleRead).toHaveBeenCalledTimes(1)

    fireEvent.click(deleteBtn)
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('shows mark as unread when already read', () => {
    const onToggleRead = vi.fn()
    render(<FloatingActions read={true} onToggleRead={onToggleRead} onDelete={() => {}} />)
    expect(screen.getByTitle('Mark as unread')).toBeInTheDocument()
  })
})
