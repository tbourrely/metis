import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResourceHeader from './ResourceHeader'

describe('ResourceHeader', () => {
  it('renders backlink, title and author', () => {
    const article = { id: '1', name: 'Test Title', type: 'document', source: { name: 'Jane Doe', url: '' }, createdAt: '' }
    render(<ResourceHeader article={article} read={false} />)

    expect(screen.getByText('← Back')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText(/By Jane Doe/)).toBeInTheDocument()
  })

  it('shows Read badge when read is true', () => {
    const article = { id: '1', name: 'T', type: 'document', source: { name: 'A', url: '' }, createdAt: '' }
    render(<ResourceHeader article={article} read={true} />)
    expect(screen.getByText('Read')).toBeInTheDocument()
  })
})
