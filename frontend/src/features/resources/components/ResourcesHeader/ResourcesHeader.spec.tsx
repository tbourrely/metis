import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResourcesHeader from './ResourcesHeader'

describe('ResourcesHeader', () => {
  it('renders title, hide-read toggle and search input and forwards handlers', () => {
    const setHideRead = vi.fn()
    const onSearch = vi.fn()
    const onCreated = vi.fn()

    render(<ResourcesHeader hideRead={false} setHideRead={setHideRead} onCreated={onCreated} onSearch={onSearch} />)

    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Hide read resources')).toBeInTheDocument()

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    fireEvent.click(checkbox)
    expect(setHideRead).toHaveBeenCalledWith(true)

    const input = screen.getByPlaceholderText(/Search resources.../i) as HTMLInputElement
    expect(input).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'hello' } })
    expect(onSearch).toHaveBeenCalledWith('hello')
  })
})
