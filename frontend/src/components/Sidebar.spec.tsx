import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Sidebar from './Sidebar'
import { SidebarProvider } from '../contexts/SidebarContext'
import useSidebar from '../hooks/useSidebar'
import React from 'react'

describe('Sidebar', () => {
  it('renders app name and resources link', () => {
    render(<SidebarProvider><Sidebar /></SidebarProvider>)
    expect(screen.getAllByText('Metis')[0]).toBeInTheDocument()
    expect(screen.getAllByText('Resources')[0]).toBeInTheDocument()
  })

  it('toggles the sliding menu via context toggle', async () => {
    function TestApp() {
      const { toggle } = useSidebar()
      return (
        <div>
          <button aria-label="test-toggle" onClick={toggle}>t</button>
          <Sidebar />
        </div>
      )
    }

    render(<SidebarProvider><TestApp /></SidebarProvider>)
    const dialog = screen.getByRole('dialog', { hidden: true })
    expect(dialog).toBeInTheDocument()
    // initially hidden
    expect(dialog).toHaveAttribute('aria-hidden', 'true')
    // click the toggle from the test app
    const toggleButton = screen.getByLabelText('test-toggle')
    toggleButton.click()
    await waitFor(() => expect(dialog).toHaveAttribute('aria-hidden', 'false'))
    // the Upload JSON link should be present
    expect(screen.getAllByText('Upload JSON')[0]).toBeInTheDocument()
  })
})
