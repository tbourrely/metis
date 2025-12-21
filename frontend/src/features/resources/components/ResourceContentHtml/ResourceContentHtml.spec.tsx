import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResourceContentHtml from './ResourceContentHtml'

describe('ArticleContent', () => {
  it('renders HTML content', () => {
    const html = '<p>Hello <strong>World</strong></p>'
    render(<ResourceContentHtml html={html} read={false} />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  it('applies reduced opacity when read', () => {
    const html = '<p>Hi</p>'
    const { container } = render(<ResourceContentHtml html={html} read={true} />)
    const el = container.querySelector('.prose')
    expect(el).toBeTruthy()
    expect((el as Element).getAttribute('style') || '').toContain('opacity: 0.8')
  })
})
