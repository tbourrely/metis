import { useContext } from 'react'
import { SidebarContext } from '../contexts/SidebarContextValue'

export default function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

export { useSidebar as useSidebarHook }
