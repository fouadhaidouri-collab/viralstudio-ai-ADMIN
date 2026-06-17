"use client";
import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  isMobileOpen: false,
  setMobileOpen: () => {},
});

export function SidebarProvider({ children }) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ isMobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
