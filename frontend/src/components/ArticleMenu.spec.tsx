import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ArticleMenu from './ArticleMenu'

describe('ArticleMenu', () => {
  it('renders menu and calls handlers', () => {
    const articles = [{ id: 1, title: 'T', author: 'A' }]
    const onToggleRead = vi.fn()
    const onDelete = vi.fn()
    const menuInfo = { id: 1, top: 0, left: 0 }

    render(<ArticleMenu menuInfo={menuInfo} onToggleRead={onToggleRead} onDelete={onDelete} articles={articles} />)

    expect(screen.getByText('Mark as read')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Mark as read'))
    expect(onToggleRead).toHaveBeenCalledWith(1)

    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
