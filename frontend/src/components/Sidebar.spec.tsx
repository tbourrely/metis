import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  it('renders app name and resources link', () => {
    render(<Sidebar />)
    expect(screen.getByText('Metis')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })
})
