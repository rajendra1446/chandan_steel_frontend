"use client";

import Link from "next/link";

import {
    usePathname,
    useRouter,
} from "next/navigation";

import {
    LayoutDashboard,
    Package,
    Factory,
    ArrowRightLeft,
    Search,
    LogOut,
    X,
} from "lucide-react";

import { logout } from "../../lib/auth";

interface SidebarProps {
    mobileOpen?: boolean;
    setMobileOpen?: (
        value: boolean
    ) => void;
}

interface MenuItem {
    name: string;
    href: string;
    icon: React.ElementType;
}

const menuItems: MenuItem[] = [

    {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },

    {
        name: "Products",
        href: "/dashboard/products",
        icon: Package,
    },

    {
        name: "Production",
        href: "/dashboard/production",
        icon: Factory,
    },

    {
        name: "Transfers",
        href: "/dashboard/transfers",
        icon: ArrowRightLeft,
    },

    {
        name: "Traceability",
        href: "/dashboard/traceability",
        icon: Search,
    },
];

export default function Sidebar({
    mobileOpen = false,
    setMobileOpen,
}: SidebarProps) {

    const pathname = usePathname();

    const router = useRouter();

    const handleLogout = () => {

        logout();

        router.push("/login");
    };

    return (
        <>
            {mobileOpen && (

                <div
                    onClick={() =>
                        setMobileOpen?.(false)
                    }
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
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
                    transition-transform
                    lg:translate-x-0
                    ${
                        mobileOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* BRAND */}

                <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">

                    <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">

                            <Factory size={22} />

                        </div>

                        <div>

                            <h1 className="font-bold">
                                Chandan Steel
                            </h1>

                            <p className="text-xs text-slate-400">
                                Traceability
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={() =>
                            setMobileOpen?.(false)
                        }
                        className="lg:hidden"
                    >

                        <X size={20} />

                    </button>

                </div>

                {/* MENU */}

                <nav className="p-4 space-y-2">

                    {menuItems.map((item) => {

                        const Icon =
                            item.icon;

                        const active =
                            pathname === item.href;

                        return (

                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() =>
                                    setMobileOpen?.(
                                        false
                                    )
                                }
                                className={`
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    rounded-lg
                                    transition
                                    ${
                                        active
                                            ? "bg-orange-500 text-white"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }
                                `}
                            >

                                <Icon size={19} />

                                <span>
                                    {item.name}
                                </span>

                            </Link>

                        );
                    })}

                </nav>

                {/* LOGOUT */}

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                    >

                        <LogOut size={19} />

                        Logout

                    </button>

                </div>

            </aside>
        </>
    );
}