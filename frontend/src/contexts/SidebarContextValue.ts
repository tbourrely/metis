import { createContext } from 'react'

export type SidebarContextType = {
  open: boolean
  toggle: () => void
  openSidebar: () => void
  closeSidebar: () => void
  setOpen: (v: boolean) => void
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined)
