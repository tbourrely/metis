import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateResourceForm from './CreateResourceForm'

const createResourceMock = vi.fn()
let errorValue: Error | null = null
vi.mock('../../hooks/useCreateResource', () => {
  return {
    default: () => ({ createResource: createResourceMock, error: errorValue })
  }
})

describe('CreateResourceForm', () => {
  beforeEach(() => { createResourceMock.mockReset(); errorValue = null })

  it('renders input and button', () => {
    render(<CreateResourceForm />)
    expect(screen.getByPlaceholderText('url')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('calls createResource and onCreated on submit', async () => {
    const onCreated = vi.fn()
    createResourceMock.mockResolvedValue('ok')
    render(<CreateResourceForm onCreated={onCreated} />)

    const input = screen.getByPlaceholderText('url') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByText('Add'))

    await waitFor(() => {
      expect(createResourceMock).toHaveBeenCalledWith('https://example.com')
      expect(onCreated).toHaveBeenCalled()
      expect(screen.getByText('Resource created successfully!')).toBeInTheDocument()
    })
  })

  it('shows error message when hook reports an error', () => {
    errorValue = new Error('create failed')
    render(<CreateResourceForm />)
    expect(screen.getByText('Failed to create resource')).toBeInTheDocument()
  })
})
