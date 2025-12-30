import React, { useState } from 'react'
import { SidebarContext } from './SidebarContextValue'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((v) => !v)
  const openSidebar = () => setOpen(true)
  const closeSidebar = () => setOpen(false)

  return (
    <SidebarContext.Provider value={{ open, toggle, openSidebar, closeSidebar, setOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}
