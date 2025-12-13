import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
	it('renders correctly with children', () => {
		render(<Button>Click me</Button>)

		expect(screen.getByText('Click me')).toBeInTheDocument()
	})

	it('calls onClick when clicked', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Click me</Button>)

		fireEvent.click(screen.getByText('Click me'))

		expect(handleClick).toHaveBeenCalledTimes(1)
	})

	it('does not call onClick when disabled', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick} disabled>Click me</Button>)

		fireEvent.click(screen.getByText('Click me'))

		expect(handleClick).not.toHaveBeenCalled()
	})

	it('applies the disabled class when disabled', () => {
		render(<Button disabled>Click me</Button>)

		const button = screen.getByText('Click me')
		expect(button).toHaveClass('button--disabled')
		expect(button).toBeDisabled()
	})
})
