"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Sparkles,
    Flame,
    Boxes,
    Package,
    Factory,
    ArrowRightLeft,
    Network,
    LogOut,
    X,
    Bot,
} from "lucide-react";
import { logout } from "../../lib/auth";

interface SidebarProps {
    mobileOpen?: boolean;
    setMobileOpen?: (value: boolean) => void;
    onOpenAi?: () => void;
}

interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

interface MenuSection {
    sectionTitle?: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        items: [
            {
                name: "Dashboard",
                href: "/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        sectionTitle: "PRIMARY STEELMAKING (SMS)",
        items: [
            {
                name: "Grades Master",
                href: "/dashboard/grades",
                icon: Sparkles,
            },
            {
                name: "Furnace Heats",
                href: "/dashboard/heats",
                icon: Flame,
            },
            {
                name: "Cast Billets",
                href: "/dashboard/billet",
                icon: Boxes,
            },
        ],
    },
    {
        sectionTitle: "MANUFACTURING & PRODUCTION",
        items: [
            {
                name: "Unit Transfers",
                href: "/dashboard/transfers",
                icon: ArrowRightLeft,
            },
            {
                name: "Production Batches",
                href: "/dashboard/production",
                icon: Factory,
            },
            {
                name: "Finished Products",
                href: "/dashboard/products",
                icon: Package,
            },
        ],
    },
    {
        sectionTitle: "COMPLIANCE & AUDIT",
        items: [
            {
                name: "Heat-Billet Trace",
                href: "/dashboard/traceability",
                icon: Network,
                badge: "E2E",
            },
        ],
    },
];

export default function Sidebar({
    mobileOpen = false,
    setMobileOpen,
    onOpenAi,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <>
            {/* MOBILE BACKDROP */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen?.(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
                />
            )}

            <aside
                className={`
                    fixed
                    left-0
                    top-0
                    h-screen
                    w-64
                    bg-slate-950
                    text-white
                    z-50
                    flex
                    flex-col
                    border-r
                    border-slate-800/80
                    shadow-xl
                    transition-transform
                    duration-300
                    ease-in-out
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* BRAND HEADER */}
                <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
                    <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen?.(false)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center p-0.5 border border-white/10 shadow-xs">
                            <Image
                                src="/chandan_logo.jpg"
                                className="rounded object-cover"
                                alt="Chandan Steel Logo"
                                width={36}
                                height={36}
                            />
                        </div>

                        <div>
                            <h1 className="font-extrabold text-sm tracking-wide text-white group-hover:text-orange-400 transition">
                                CHANDAN STEEL
                            </h1>
                            <p className="text-[11px] font-semibold text-slate-400 tracking-wider">
                                MES & TRACEABILITY
                            </p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setMobileOpen?.(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
                        title="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* NAVIGATION MENU */}
                <nav className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs font-semibold">
                    {menuSections.map((section, sIdx) => (
                        <div key={sIdx} className="space-y-1">
                            {section.sectionTitle && (
                                <p className="px-3 pt-2 pb-1 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                    {section.sectionTitle}
                                </p>
                            )}

                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isActive =
                                    item.href === "/dashboard"
                                        ? pathname === "/dashboard"
                                        : pathname.startsWith(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen?.(false)}
                                        className={`
                                            group
                                            flex
                                            items-center
                                            justify-between
                                            px-3.5
                                            py-2.5
                                            rounded-xl
                                            transition-all
                                            duration-200
                                            ${
                                                isActive
                                                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20 font-bold"
                                                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={18}
                                                className={`transition-transform duration-200 group-hover:scale-110 ${
                                                    isActive ? "text-white" : "text-slate-400 group-hover:text-orange-400"
                                                }`}
                                            />
                                            <span className="text-xs tracking-tight">
                                                {item.name}
                                            </span>
                                        </div>

                                        {item.badge && (
                                            <span
                                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                                    isActive
                                                        ? "bg-white/20 text-white"
                                                        : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}

                    {/* AI COPILOT LAUNCH CARD */}
                    {onOpenAi && (
                        <div className="pt-2 px-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setMobileOpen?.(false);
                                    onOpenAi();
                                }}
                                className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-slate-900 border border-orange-500/30 hover:border-orange-500/60 transition group cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Bot size={16} className="text-orange-400 animate-bounce" />
                                        <span className="text-xs font-bold text-white group-hover:text-orange-300">
                                            AI Copilot
                                        </span>
                                    </div>
                                    <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-extrabold">
                                        LIVE
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-normal line-clamp-2">
                                    Ask billet balances, heat dependencies & product yields.
                                </p>
                            </button>
                        </div>
                    )}
                </nav>

                {/* USER LOGOUT FOOTER */}
                <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <LogOut size={17} />
                            <span>Sign Out</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono">v1.2</span>
                    </button>
                </div>
            </aside>
        </>
    );
}