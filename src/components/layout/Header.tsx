"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    Bell,
    Menu,
    User,
} from "lucide-react";

import { getUser } from "../../lib/auth";

import type { User as UserType } from "../../types/auth";

interface HeaderProps {
    setMobileOpen: (
        value: boolean
    ) => void;
}

export default function Header({
    setMobileOpen,
}: HeaderProps) {

    const [user, setUser] =
        useState<UserType | null>(null);

    useEffect(() => {

        setUser(getUser());

    }, []);

    return (
        <header className="h-20 bg-white border-b flex items-center justify-between px-4 lg:px-8">

            {/* MOBILE MENU */}

            <button
                onClick={() =>
                    setMobileOpen(true)
                }
                className="lg:hidden"
            >

                <Menu size={24} />

            </button>

            <div className="hidden lg:block">

                <p className="text-sm text-slate-500">
                    Steel Traceability Management
                </p>

                <p className="font-semibold">
                    Production Overview
                </p>

            </div>

            <div className="flex items-center gap-5">

                <button className="relative">

                    <Bell
                        size={20}
                        className="text-slate-500"
                    />

                    <span className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />

                </button>

                <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">

                        <User
                            size={18}
                            className="text-orange-600"
                        />

                    </div>

                    <div className="hidden sm:block">

                        <p className="text-sm font-semibold">
                            {user?.name || "User"}
                        </p>

                        <p className="text-xs text-slate-500">
                            {user?.role || "USER"}
                        </p>

                    </div>

                </div>

            </div>

        </header>
    );
}