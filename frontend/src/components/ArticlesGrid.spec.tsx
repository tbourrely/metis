import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ArticlesGrid from './ArticlesGrid'

describe('ArticlesGrid', () => {
  it('renders a grid of article cards', () => {
    const articles = [
      { id: 1, title: 'A1', author: 'A' },
      { id: 2, title: 'A2', author: 'B' },
    ]
    const onMenuOpen = () => {}

    render(<ArticlesGrid articles={articles} onMenuOpen={onMenuOpen} />)

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
  })
})
