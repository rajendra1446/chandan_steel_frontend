"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import AiCopilot from "../../components/layout/AiCopilot";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState<string | undefined>(undefined);

    const handleOpenAi = (promptHint?: string) => {
        setAiPrompt(promptHint);
        setAiOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-orange-500 selection:text-white">
            {/* SIDEBAR NAVIGATION */}
            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                onOpenAi={() => handleOpenAi()}
            />

            {/* MAIN CONTENT WRAPPER */}
            <div className="lg:ml-64 flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* TOP HEADER */}
                <Header
                    setMobileOpen={setMobileOpen}
                    onOpenAi={() => handleOpenAi()}
                />

                {/* PAGE BODY */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>

            {/* RIGHT SIDE AI COPILOT DRAWER */}
            <AiCopilot
                isOpen={aiOpen}
                onClose={() => {
                    setAiOpen(false);
                    setAiPrompt(undefined);
                }}
                initialPrompt={aiPrompt}
            />

            {/* FLOATING QUICK-ACTION AI LAUNCHER BUTTON */}
            {!aiOpen && (
                <button
                    type="button"
                    onClick={() => handleOpenAi()}
                    className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-bold text-xs tracking-wide border border-white/20"
                    title="Open AI Metallurgical Copilot"
                >
                    <Sparkles size={18} className="animate-spin-slow text-white" />
                    <span className="hidden sm:inline">AI Copilot</span>
                    <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping" />
                </button>
            )}
        </div>
    );
}