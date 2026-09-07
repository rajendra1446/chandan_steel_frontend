"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
    Bell,
    Menu,
    User,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import { getUser } from "../../lib/auth";
import type { User as UserType } from "../../types/auth";

interface HeaderProps {
    setMobileOpen: (value: boolean) => void;
    onOpenAi?: () => void;
}

// Map route paths to friendly plant section labels
const routeLabels: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": {
        title: "Plant Operational Overview",
        subtitle: "Integrated Steel Melting & Rolling Mill Summary",
    },
    "/dashboard/grades": {
        title: "Steel Grades Master",
        subtitle: "Chemical specifications & mechanical standards",
    },
    "/dashboard/heats": {
        title: "SMS Furnace Heats",
        subtitle: "Melt cycles, scrap charge & liquid steel output",
    },
    "/dashboard/billet": {
        title: "Continuous Billet Casting",
        subtitle: "Cast billet logging, heat lineage & yard inventory",
    },
    "/dashboard/products": {
        title: "Finished Products Master",
        subtitle: "Prime rebar, wire rod & rolled steel specifications",
    },
    "/dashboard/production": {
        title: "Rolling Mill Production",
        subtitle: "Billet consumption, rolling batches & finished product yield",
    },
    "/dashboard/transfers": {
        title: "Material Transfers",
        subtitle: "Inter-unit logistics between SMS, yard & rolling mills",
    },
    "/dashboard/traceability": {
        title: "Metallurgical Traceability",
        subtitle: "Heat-to-billet-to-product chain of custody audit trail",
    },
};

export default function Header({
    setMobileOpen,
    onOpenAi,
}: HeaderProps) {
    const pathname = usePathname();
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        setUser(getUser());
    }, []);

    const activeInfo = routeLabels[pathname] || {
        title: "Chandan Steel MES",
        subtitle: "Traceability & Manufacturing Execution System",
    };

    return (
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-2xs">
            {/* LEFT: MOBILE TOGGLE & SECTION TITLE */}
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition lg:hidden cursor-pointer"
                    title="Open navigation menu"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Chandan MES
                        </span>
                        <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                            {activeInfo.title}
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 hidden md:block mt-0.5">
                        {activeInfo.subtitle}
                    </p>
                </div>
            </div>

            {/* RIGHT: AI COPILOT LAUNCHER, NOTIFICATIONS & USER PROFILE */}
            <div className="flex items-center gap-2.5 sm:gap-4">
                {/* AI COPILOT BUTTON */}
                {onOpenAi && (
                    <button
                        type="button"
                        onClick={onOpenAi}
                        className="group relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer text-xs font-bold"
                        title="Open AI Metallurgical Copilot"
                    >
                        <Sparkles size={16} className="animate-spin-slow text-white" />
                        <span className="hidden sm:inline">AI Copilot</span>
                        <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-white animate-ping" />
                    </button>
                )}

                {/* NOTIFICATIONS */}
                <button
                    type="button"
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                    title="Plant alerts"
                >
                    <Bell size={19} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white" />
                </button>

                {/* USER PROFILE */}
                <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 border border-orange-200 flex items-center justify-center shadow-2xs">
                            <User size={17} className="text-orange-600 font-bold" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    </div>

                    <div className="hidden sm:block text-left">
                        <p className="text-xs font-bold text-slate-900 leading-tight">
                            {user?.name || "Plant Operator"}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={11} className="text-orange-500" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                {user?.role || "ENGINEER"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}