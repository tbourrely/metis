import React from 'react'

interface ButtonProps {
	onClick?: () => void
	children: React.ReactNode
	disabled?: boolean
}

export const Button = ({ onClick, children, disabled = false }: ButtonProps) => {
	return (
		<button
			className={`button ${disabled ? 'button--disabled' : ''}`}
			onClick={onClick}
			disabled={disabled}
		>
			{children}
		</button>
	)
}
