"use client";

import Link from "next/link";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { SidebarProvider } from "../components/SidebarContext";
import Icon from "../components/Icon";

export default function ClippingPage() {
  return (
    <div className="h-screen overflow-hidden no-x-scroll">
      <SidebarProvider>
      <Sidebar />
      <TopBar />
      <main className="fixed top-14 md:top-16 right-0 w-full md:w-[calc(100%-16rem)] bottom-0 overflow-y-auto smooth-scroll">
        <div className="flex items-center justify-center min-h-full px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 flex items-center justify-center mx-auto mb-6">
              <Icon name="construction" className="text-yellow-400" size={40} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Geist, sans-serif' }}>AI Clipping</h1>
            <p className="text-sm text-on-surface-variant mb-6">This tool is currently under maintenance. We&apos;re working on bringing you an even better experience. Check back soon!</p>
            <Link href="/" className="inline-flex items-center gap-2 primary-gradient text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
              <Icon name="arrow_back" size={16} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
      </SidebarProvider>
    </div>
  );
}
