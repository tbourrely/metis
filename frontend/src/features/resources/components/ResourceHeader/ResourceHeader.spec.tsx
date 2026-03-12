import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResourceHeader from './ResourceHeader'
import type { Resource } from '../../types/resource'

describe('ResourceHeader', () => {
  it('renders backlink, title and author', () => {
    const article: Resource = { id: '1', name: 'Test Title', type: 'document', source: { name: 'Jane Doe', url: '' }, createdAt: '', read: false, highlights: [] }
    render(<ResourceHeader resource={article} read={false} />)

    expect(screen.getByText('← Back')).toBeInTheDocument()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText(/By Jane Doe/)).toBeInTheDocument()
  })

  it('shows Read badge when read is true', () => {
    const article: Resource = { id: '1', name: 'T', type: 'document', source: { name: 'A', url: '' }, createdAt: '', read: true, highlights: [] }
    render(<ResourceHeader resource={article} read={true} />)
    expect(screen.getByText('Read')).toBeInTheDocument()
  })
})
