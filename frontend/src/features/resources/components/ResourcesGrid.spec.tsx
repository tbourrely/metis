import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResourcesGrid from './ResourcesGrid'

describe('ArticlesGrid', () => {
  it('renders a grid of article cards', () => {
    const articles = [
      { id: '1', name: 'A1', type: 'document', source: { name: 'A', url: '' }, createdAt: '' },
      { id: '2', name: 'A2', type: 'document', source: { name: 'B', url: '' }, createdAt: '' },
    ]
    const onMenuOpen = () => {}

    render(<ResourcesGrid articles={articles} onMenuOpen={onMenuOpen} />)

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
  })
})
