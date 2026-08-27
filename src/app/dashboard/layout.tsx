"use client";

import { useState } from "react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({
    children,
}: DashboardLayoutProps) {

    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100">

            <Sidebar />

            <div className="ml-64">

                <Header
                    setMobileOpen={setMobileOpen}
                />

                <main className="p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}