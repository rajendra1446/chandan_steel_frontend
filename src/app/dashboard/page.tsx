"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Package,
    Factory,
    ArrowRightLeft,
    Network,
    ArrowUpRight,
    Flame,
    Boxes,
    Sparkles,
    TrendingUp,
    Scale,
    Layers,
    Bot,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import { api } from "@/lib/api";

interface QuickCard {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
    badge?: string;
}

const quickCards: QuickCard[] = [
    {
        title: "Steel Grades Master",
        description: "Standard metallurgical compositions & chemical specs",
        icon: Sparkles,
        href: "/dashboard/grades",
        badge: "Grade Spec",
    },
    {
        title: "SMS Furnace Heats",
        description: "Furnace melt logging, charge scrap & liquid steel output",
        icon: Flame,
        href: "/dashboard/heats",
        badge: "Melting Shop",
    },
    {
        title: "Billet Continuous Casting",
        description: "Continuous cast billet registration, yard stock & weight",
        icon: Boxes,
        href: "/dashboard/billet",
        badge: "Billet Yard",
    },
    {
        title: "Material Transfers",
        description: "Track billet movement between SMS, yards, and rolling mills",
        icon: ArrowRightLeft,
        href: "/dashboard/transfers",
        badge: "Transit",
    },
    {
        title: "Rolling Mill Production",
        description: "Feed cast billets into rolling mills & log finished batches",
        icon: Factory,
        href: "/dashboard/production",
        badge: "Rolling Mill",
    },
    {
        title: "Finished Prime Products",
        description: "Manufactured rebar, wire rod, round bar & coils catalog",
        icon: Package,
        href: "/dashboard/products",
        badge: "Prime Steel",
    },
    {
        title: "End-to-End Traceability",
        description: "Chain of custody: trace from raw scrap charge to finished goods",
        icon: Network,
        href: "/dashboard/traceability",
        badge: "Audit Ready",
    },
];

const lifecycleSteps = [
    { step: "01", name: "Steel Grade", desc: "Chemical Standard", href: "/dashboard/grades" },
    { step: "02", name: "Furnace Heat", desc: "Scrap Melt Cycle", href: "/dashboard/heats" },
    { step: "03", name: "Billet Cast", desc: "Caster Ingot Cut", href: "/dashboard/billet" },
    { step: "04", name: "Unit Transfer", desc: "Mill Bay Transit", href: "/dashboard/transfers" },
    { step: "05", name: "Rolling Mill", desc: "Hot Rebar Roll", href: "/dashboard/production" },
    { step: "06", name: "Prime Product", desc: "Customer Dispatch", href: "/dashboard/products" },
];

export default function DashboardPage() {
    const [stats, setStats] = useState({
        heatsCount: 0,
        billetsCount: 0,
        productionBatches: 0,
        productsCount: 0,
        loading: true,
    });

    useEffect(() => {
        Promise.all([
            api.getHeats().catch(() => ({ data: [] })),
            api.getBillets().catch(() => ({ data: [] })),
            api.getProduction().catch(() => ({ data: [] })),
            api.getProducts().catch(() => ({ data: [] })),
        ]).then(([heatsRes, billetsRes, prodRes, productsRes]) => {
            setStats({
                heatsCount: heatsRes?.data?.length || 0,
                billetsCount: billetsRes?.data?.length || 0,
                productionBatches: prodRes?.data?.length || 0,
                productsCount: productsRes?.data?.length || 0,
                loading: false,
            });
        });
    }, []);

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <PageHeader
                title="Operational Overview"
                subtitle="Integrated Manufacturing Execution & Traceability Dashboard for Chandan Steel"
                badge="Enterprise MES"
                icon={Factory}
                onOpenAi={() => {}}
                aiPromptHint="how many billet were consumed and remain"
            />

            {/* LIVE KPI STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="SMS Furnace Heats"
                    value={stats.loading ? "..." : stats.heatsCount}
                    subtitle="Active logged furnace melts"
                    icon={<Flame size={22} />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                    badge="Melt Shop"
                />
                <StatCard
                    title="Cast Billets Logged"
                    value={stats.loading ? "..." : stats.billetsCount}
                    subtitle="Continuous caster yard inventory"
                    icon={<Boxes size={22} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                    badge="Yard Stock"
                />
                <StatCard
                    title="Rolling Mill Batches"
                    value={stats.loading ? "..." : stats.productionBatches}
                    subtitle="Mill consumption & rolling runs"
                    icon={<Layers size={22} />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    badge="Hot Mill"
                />
                <StatCard
                    title="Prime Finished Products"
                    value={stats.loading ? "..." : stats.productsCount}
                    subtitle="Registered steel SKUs"
                    icon={<Package size={22} />}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                    badge="Products"
                />
            </div>

            {/* AI METALLURGICAL ASSISTANT BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
                        <Sparkles size={13} className="text-orange-400" />
                        <span>Chandan AI Steel Intelligence</span>
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                        Need Billet Balances or Multi-Heat Lineage?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                        Ask the AI copilot how many billets were consumed, how many remain in the yard, what products were produced, or inspect single vs sequence heat casting dependencies.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link
                        href="/dashboard/traceability"
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                    >
                        <Network size={15} />
                        Traceability Center
                    </Link>
                    <Link
                        href="/dashboard/billet"
                        className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-orange-500/20"
                    >
                        <Boxes size={15} />
                        Inspect Billets
                    </Link>
                </div>
            </div>

            {/* OPERATIONAL NAVIGATION CARDS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Plant Operation Modules</h2>
                        <p className="text-xs text-slate-500">
                            Select a department module to log, manage, and trace steel manufacturing
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{quickCards.length} Modules</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {quickCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="group bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-orange-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-200">
                                            <Icon
                                                size={22}
                                                className="text-orange-600 group-hover:text-white transition-colors duration-200"
                                            />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            {card.badge && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 group-hover:border-orange-200">
                                                    {card.badge}
                                                </span>
                                            )}
                                            <ArrowUpRight
                                                size={18}
                                                className="text-slate-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            />
                                        </div>
                                    </div>

                                    <h3 className="text-base font-extrabold text-slate-900 mt-4 group-hover:text-orange-600 transition-colors">
                                        {card.title}
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                        {card.description}
                                    </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-orange-600 font-semibold">
                                    <span>Access Module</span>
                                    <span>→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* 6-STEP METALLURGICAL TRACEABILITY WORKFLOW */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            6-Stage Steel Traceability Lifecycle
                        </h2>
                        <p className="text-xs text-slate-500">
                            End-to-end chain of custody from raw charge materials to customer dispatch
                        </p>
                    </div>
                    <Link
                        href="/dashboard/traceability"
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 self-start"
                    >
                        <span>Full Traceability Engine</span>
                        <span>→</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {lifecycleSteps.map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.href}
                            className="bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-300 rounded-xl p-3.5 transition group text-center"
                        >
                            <span className="text-[10px] font-extrabold text-orange-600 tracking-wider">
                                STEP {item.step}
                            </span>
                            <p className="font-extrabold text-slate-900 text-sm mt-1 group-hover:text-orange-600 transition-colors">
                                {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}