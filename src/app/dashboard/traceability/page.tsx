"use client";

import {
    FormEvent,
    useState,
    useEffect,
    Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Factory,
    ArrowRight,
    CircleCheck,
    Package,
    Flame,
    Layers,
    ChevronDown,
    ChevronUp,
    TrendingDown,
    Activity,
    Clock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";

import { api } from "../../../lib/api";
import type {
    TraceabilityData,
    HeatTraceabilityData,
    DetailedBillet,
} from "../../../types/traceability";

export default function TraceabilityPage() {
    return (
        <Suspense fallback={<div className="p-6 text-slate-500 font-medium">Loading metallurgical traceability engine...</div>}>
            <TraceabilityContent />
        </Suspense>
    );
}

function TraceabilityContent() {
    const searchParams = useSearchParams();
    const heatParam = searchParams.get("heat");
    const billetParam = searchParams.get("billet");

    const [searchType, setSearchType] = useState<"heat" | "billet">("heat");
    const [searchValue, setSearchValue] = useState("");

    const [heatData, setHeatData] = useState<HeatTraceabilityData | null>(null);
    const [billetData, setBilletData] = useState<TraceabilityData | null>(null);

    const [expandedBilletId, setExpandedBilletId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Quick suggestions from database
    const [availableHeats, setAvailableHeats] = useState<string[]>([]);
    const [availableBillets, setAvailableBillets] = useState<string[]>([]);

    // Fetch quick samples on mount
    useEffect(() => {
        Promise.all([
            api.getHeats().catch(() => ({ data: [] })),
            api.getBillets().catch(() => ({ data: [] })),
        ]).then(([heatsRes, billetsRes]) => {
            if (heatsRes?.data) {
                const heatNos = Array.from(new Set(heatsRes.data.map((h: any) => h.heat_no).filter(Boolean)));
                setAvailableHeats(heatNos as string[]);
            }
            if (billetsRes?.data) {
                const billetNos = Array.from(new Set(billetsRes.data.map((b: any) => b.billet_no).filter(Boolean)));
                setAvailableBillets(billetNos as string[]);
            }
        });
    }, []);

    // Auto-search if URL contains query parameter
    useEffect(() => {
        if (heatParam) {
            setSearchType("heat");
            setSearchValue(heatParam);
            fetchHeatTrace(heatParam);
        } else if (billetParam) {
            setSearchType("billet");
            setSearchValue(billetParam);
            fetchBilletTrace(billetParam);
        }
    }, [heatParam, billetParam]);

    const fetchHeatTrace = async (heatNo: string) => {
        const cleanNo = heatNo.trim();
        if (!cleanNo) return;

        try {
            setLoading(true);
            setError("");
            setBilletData(null);

            const response = await api.getHeatTraceability(cleanNo);
            setHeatData(response.data);
            if (response.data.billets.length > 0) {
                setExpandedBilletId(response.data.billets[0].id);
            }
        } catch (err) {
            setHeatData(null);
            setError(err instanceof Error ? err.message : `Heat "${cleanNo}" could not be traced`);
        } finally {
            setLoading(false);
        }
    };

    const fetchBilletTrace = async (billetNo: string) => {
        const cleanNo = billetNo.trim();
        if (!cleanNo) return;

        try {
            setLoading(true);
            setError("");
            setHeatData(null);

            const response = await api.getBilletTraceability(cleanNo);
            setBilletData(response.data);
        } catch (err) {
            setBilletData(null);
            setError(err instanceof Error ? err.message : `Billet "${cleanNo}" not found`);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const term = searchValue.trim();
        if (!term) return;

        if (searchType === "heat") {
            fetchHeatTrace(term);
        } else {
            fetchBilletTrace(term);
        }
    };

    const handleHeatClick = (heatNo: string) => {
        setSearchType("heat");
        setSearchValue(heatNo);
        fetchHeatTrace(heatNo);
    };

    const handleBilletClick = (billetNo: string) => {
        setSearchType("billet");
        setSearchValue(billetNo);
        fetchBilletTrace(billetNo);
    };

    const toggleBilletExpand = (id: number) => {
        setExpandedBilletId((prev) => (prev === id ? null : id));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white p-6 rounded-2xl shadow-sm border border-slate-700/50">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Enterprise Metallurgical Traceability
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                            <ShieldCheck size={14} /> Chain of Custody Verified
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Steel Melt & Billet Traceability
                    </h1>
                    <p className="text-slate-300 text-sm mt-1">
                        Trace from furnace scrap charge to continuous billet casting, rolling mill batches, and finished stainless products.
                    </p>
                </div>
            </div>

            {/* SEARCH PANEL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => {
                                setSearchType("heat");
                                setError("");
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                                searchType === "heat"
                                    ? "bg-white text-orange-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Flame size={15} />
                            Trace by Heat Number
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchType("billet");
                                setError("");
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
                                searchType === "billet"
                                    ? "bg-white text-orange-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <Package size={15} />
                            Trace by Billet Number
                        </button>
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                        Showing comprehensive material yield & consumption
                    </span>
                </div>

                <form onSubmit={handleSearch}>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search
                                size={19}
                                className="absolute left-3.5 top-3.5 text-slate-400"
                            />
                            <input
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder={
                                    searchType === "heat"
                                        ? "Enter or paste Heat Number (e.g. H260825001, H-2026-001)"
                                        : "Enter or paste Billet Number (e.g. B260825001, B-1001)"
                                }
                                className="w-full border border-slate-300 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-slate-900 font-medium text-sm transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Tracing...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={16} />
                                    <span>Trace Chain</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* QUICK SUGGESTION CHIPS */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        Quick Samples:
                    </span>
                    {searchType === "heat" ? (
                        availableHeats.length > 0 ? (
                            availableHeats.slice(0, 8).map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    onClick={() => handleHeatClick(h)}
                                    className="px-2.5 py-1 text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg transition"
                                >
                                    {h}
                                </button>
                            ))
                        ) : (
                            <span className="text-slate-400 italic">No recorded heats found in DB</span>
                        )
                    ) : (
                        availableBillets.length > 0 ? (
                            availableBillets.slice(0, 8).map((b) => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => handleBilletClick(b)}
                                    className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition"
                                >
                                    {b}
                                </button>
                            ))
                        ) : (
                            <span className="text-slate-400 italic">No recorded billets found in DB</span>
                        )
                    )}
                </div>
            </div>

            {/* NOTICE / ERROR ALERT */}
            {error && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 shadow-sm flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-base shrink-0">
                        !
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-sm text-amber-950">Traceability Record Notice</h3>
                        <p className="text-xs text-amber-800">{error}</p>
                        <p className="text-xs text-amber-700 pt-1">
                            Click one of the available samples above or verify your Heat / Billet logging in the dashboard.
                        </p>
                    </div>
                </div>
            )}

            {/* ==================================================== */}
            {/* HEAT TRACEABILITY VIEW */}
            {/* ==================================================== */}
            {heatData && (
                <div className="space-y-6">
                    {/* HEAT OVERVIEW */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                                <Flame className="text-orange-500" size={26} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Furnace Heat Origin
                                    </p>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                                        {heatData.heat.status || "COMPLETED"}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                                    {heatData.heat.heat_no}
                                </h2>
                            </div>
                            <div className="ml-auto text-right">
                                <span className="text-xs text-slate-400 font-medium block">Furnace Shop</span>
                                <span className="text-sm font-bold text-slate-800">{heatData.heat.unit_info?.name || "Steel Melting Shop (SMS)"}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Info
                                label="Grade Specification"
                                value={`${heatData.heat.grade?.code || heatData.heat.grade_code || "-"} (${heatData.heat.grade?.name || heatData.heat.grade_name || "-"})`}
                            />
                            <Info
                                label="Heat Date"
                                value={formatDate(heatData.heat.heat_date)}
                            />
                            <Info
                                label="Furnace Charge Input"
                                value={`${Number(heatData.heat.total_input_qty || 0).toLocaleString()} ${heatData.heat.unit || "KG"}`}
                            />
                            <Info
                                label="Liquid Steel Output"
                                value={`${Number(heatData.heat.total_output_qty || 0).toLocaleString()} ${heatData.heat.unit || "KG"}`}
                            />
                        </div>
                    </div>

                    {/* HERO KPI SUMMARY CARDS (CONSUMED, REMAINING, REJECTED) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* 1. CONSUMED FOR PRODUCT */}
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/40 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                                    Billets Consumed for Product
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <Package size={18} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-3xl font-black text-emerald-950">
                                    {heatData.metrics.consumed_billets_qty.toLocaleString()} <span className="text-sm font-semibold">{heatData.metrics.unit}</span>
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-200/60 text-xs">
                                    <span className="text-emerald-800 font-semibold">
                                        {heatData.metrics.consumed_billets_count} of {heatData.metrics.total_billets_count} billet(s) processed
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                                        {heatData.metrics.total_billets_qty > 0
                                            ? `${Math.round((heatData.metrics.consumed_billets_qty / heatData.metrics.total_billets_qty) * 100)}% Consumed`
                                            : "0%"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. REMAINING BILLETS */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/40 border border-blue-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                                    Billets Remaining in Stock
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                                    <Layers size={18} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-3xl font-black text-blue-950">
                                    {heatData.metrics.remaining_billets_qty.toLocaleString()} <span className="text-sm font-semibold">{heatData.metrics.unit}</span>
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200/60 text-xs">
                                    <span className="text-blue-800 font-semibold">
                                        {heatData.metrics.remaining_billets_count} billet(s) available in yard
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200/80 text-blue-900">
                                        {heatData.metrics.total_billets_qty > 0
                                            ? `${Math.round((heatData.metrics.remaining_billets_qty / heatData.metrics.total_billets_qty) * 100)}% Available`
                                            : "0%"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 3. MATERIAL REJECTED / LOSS */}
                        <div className="bg-gradient-to-br from-rose-50 to-rose-100/40 border border-rose-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                                    Material Rejected & Scrap
                                </span>
                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                                    <TrendingDown size={18} />
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-3xl font-black text-rose-950">
                                    {heatData.metrics.total_material_rejected_qty.toLocaleString()} <span className="text-sm font-semibold">{heatData.metrics.unit}</span>
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-rose-200/60 text-xs">
                                    <span className="text-rose-800 font-semibold">
                                        Melt Loss: {heatData.metrics.heat_melt_loss_qty.toLocaleString()} KG • Scrap: {heatData.metrics.production_scrap_qty.toLocaleString()} KG
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200/80 text-rose-900">
                                        Yield: {heatData.metrics.yield_percentage}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PROCESS LIFECYCLE FLOW */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
                                Metallurgical Process Flow
                            </h3>
                            <span className="text-xs text-orange-400 font-semibold">6-Stage Traceability</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            <FlowItem text="1. Scrap & Alloy Charge" />
                            <ArrowRight className="text-orange-400" size={16} />
                            <FlowItem text="2. Electric Arc Melt" />
                            <ArrowRight className="text-orange-400" size={16} />
                            <FlowItem text="3. Continuous Billet Cast" />
                            <ArrowRight className="text-orange-400" size={16} />
                            <FlowItem text="4. Yard Transfer" />
                            <ArrowRight className="text-orange-400" size={16} />
                            <FlowItem text="5. Rolling Mill" />
                            <ArrowRight className="text-orange-400" size={16} />
                            <FlowItem text="6. Finished Steel Product" />
                        </div>
                    </div>

                    {/* ALL BILLETS ACCORDION CARDS */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Cast Billets Breakdown ({heatData.billets.length})
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Click any billet card to inspect its transfers, rolling batches, and product allocations
                                </p>
                            </div>
                            <span className="text-xs bg-orange-50 text-orange-800 border border-orange-200 font-bold px-3 py-1.5 rounded-lg">
                                Total Heat Cast: {heatData.metrics.total_billets_qty.toLocaleString()} {heatData.metrics.unit}
                            </span>
                        </div>

                        {heatData.billets.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm border border-dashed rounded-xl">
                                No billets have been registered for Heat {heatData.heat.heat_no} yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {heatData.billets.map((b) => (
                                    <BilletCard
                                        key={b.id}
                                        billet={b}
                                        isExpanded={expandedBilletId === b.id}
                                        onToggle={() => toggleBilletExpand(b.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CHARGE RAW MATERIALS */}
                    {heatData.materials.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-900 mb-3">
                                Furnace Charge Raw Materials
                            </h2>
                            <p className="text-xs text-slate-500 mb-4">
                                Exact scrap grades, ferro-alloys, and metallurgical additives charged into furnace
                            </p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="py-3 px-4">Material Code</th>
                                            <th className="py-3 px-4">Material Name</th>
                                            <th className="py-3 px-4">Classification</th>
                                            <th className="py-3 px-4 text-right">Quantity</th>
                                            <th className="py-3 px-4">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {heatData.materials.map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3 px-4 font-bold text-slate-800">{m.material_code}</td>
                                                <td className="py-3 px-4 font-medium text-slate-700">{m.material_name}</td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                                                        {m.material_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-orange-600">
                                                    {Number(m.quantity || 0).toLocaleString()} {m.unit || "KG"}
                                                </td>
                                                <td className="py-3 px-4 text-slate-500">{m.remarks || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================================================== */}
            {/* SINGLE BILLET TRACEABILITY VIEW */}
            {/* ==================================================== */}
            {billetData && (
                <div className="space-y-6">
                    {/* BILLET HERO CARD */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                <Package className="text-blue-600" size={26} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Billet Chain of Custody
                                </p>
                                <h2 className="text-2xl font-black text-slate-900">
                                    {billetData.billet.billet_no}
                                </h2>
                            </div>
                            <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                {billetData.billet.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Info
                                label="Cast Weight"
                                value={`${Number(billetData.billet.quantity).toLocaleString()} ${billetData.billet.unit}`}
                            />
                            <Info
                                label="Consumed for Product"
                                value={`${Number(billetData.billet.consumed_quantity ?? (billetData.metrics?.consumed_quantity ?? 0)).toLocaleString()} ${billetData.billet.unit}`}
                            />
                            <Info
                                label="Remaining in Stock"
                                value={`${Number(billetData.billet.remaining_quantity ?? (billetData.metrics?.remaining_quantity ?? 0)).toLocaleString()} ${billetData.billet.unit}`}
                            />
                            <Info
                                label="Casting Date"
                                value={formatDate(billetData.billet.production_date)}
                            />
                        </div>
                    </div>

                    {/* SOURCE & PARENT HEAT */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div
                            onClick={() => handleHeatClick(billetData.source.heat.heat_no)}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-orange-400 hover:shadow-md transition cursor-pointer group"
                            title="Click to trace all billets from this heat"
                        >
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                                    <Flame size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Parent Heat Origin</p>
                                    <p className="font-extrabold text-xl text-orange-600 group-hover:underline">
                                        {billetData.source.heat.heat_no} →
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Click to view full heat summary & all sibling billets
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                                    <Factory size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Steel Grade Specification</p>
                                    <p className="font-extrabold text-xl text-slate-900">
                                        {billetData.source.grade.code}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {billetData.source.grade.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TRANSFERS */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            Material Transfers & Inter-Unit Logistics
                        </h2>

                        {billetData.transfers.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No transfers logged for this billet.</p>
                        ) : (
                            <div className="space-y-3">
                                {billetData.transfers.map((transfer) => (
                                    <div key={transfer.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-900">{transfer.from_unit}</span>
                                            <ArrowRight size={16} className="text-orange-500" />
                                            <span className="font-bold text-slate-900">{transfer.to_unit}</span>
                                            <span className="text-xs text-slate-400">({transfer.from_unit_name} → {transfer.to_unit_name})</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-orange-600 text-sm">{Number(transfer.quantity).toLocaleString()} KG</span>
                                            <span className="text-xs text-slate-400 block">{formatDate(transfer.transfer_date)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ROLLING PRODUCTION BATCHES */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">
                            Rolling Mill Batches & Finished Products
                        </h2>

                        {billetData.production.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">This billet has not been rolled into finished product batches yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                                        <tr>
                                            <th className="py-3 px-4">Batch No</th>
                                            <th className="py-3 px-4">Rolling Mill</th>
                                            <th className="py-3 px-4">Billet Consumed</th>
                                            <th className="py-3 px-4">Finished Product</th>
                                            <th className="py-3 px-4 text-right">Output Produced</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {billetData.production.map((prod) => (
                                            <tr key={prod.batch_id} className="hover:bg-slate-50/60 transition">
                                                <td className="py-3 px-4 font-bold text-slate-900">{prod.batch_no}</td>
                                                <td className="py-3 px-4 text-slate-600 font-medium">{prod.unit_code}</td>
                                                <td className="py-3 px-4 font-bold text-emerald-700">
                                                    {Number(prod.billet_consumed).toLocaleString()} KG
                                                </td>
                                                <td className="py-3 px-4">
                                                    {prod.product_name ? (
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{prod.product_name}</p>
                                                            <p className="text-[11px] text-slate-400">{prod.product_code}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">In processing</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-slate-900">
                                                    {prod.product_quantity ? `${Number(prod.product_quantity).toLocaleString()} KG` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// SUB-COMPONENT: BILLET CARD WITH PROGRESS BAR
// ==========================================
function BilletCard({
    billet,
    isExpanded,
    onToggle,
}: {
    billet: DetailedBillet;
    isExpanded: boolean;
    onToggle: () => void;
}) {
    const initialQty = Number(billet.quantity) || 0;
    const consumedQty = Number(billet.consumed_quantity) || 0;
    const remainingQty = Number(billet.remaining_quantity) || Math.max(0, initialQty - consumedQty);
    const consumedPct = initialQty > 0 ? Math.min(100, Math.round((consumedQty / initialQty) * 100)) : 0;
    const remainingPct = Math.max(0, 100 - consumedPct);

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white hover:border-slate-300 shadow-sm">
            {/* BILLET ROW HEADER */}
            <div
                onClick={onToggle}
                className="p-4 cursor-pointer hover:bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 font-bold text-xs border border-orange-100 shrink-0">
                        BLT
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-base">
                                {billet.billet_no}
                            </span>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    billet.status === "AVAILABLE"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : billet.status === "IN_PRODUCTION"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-700"
                                }`}
                            >
                                {billet.status}
                            </span>
                            {billet.grade_code && (
                                <span className="text-xs text-slate-500 font-medium">
                                    • {billet.grade_code}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Cast Date: {formatDate(billet.production_date)}
                        </p>
                    </div>
                </div>

                {/* QUANTITY SUMMARY & VISUAL METER */}
                <div className="flex flex-col md:items-end gap-1.5 min-w-[280px]">
                    <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">
                            Total: <strong className="text-slate-800">{initialQty.toLocaleString()} {billet.unit}</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold">
                            Used: {consumedQty.toLocaleString()} KG
                        </span>
                        <span className="text-blue-700 font-semibold">
                            Rem: {remainingQty.toLocaleString()} KG
                        </span>
                        <button
                            type="button"
                            className="text-slate-400 hover:text-slate-600 p-1 rounded"
                        >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                        <div
                            style={{ width: `${consumedPct}%` }}
                            className="bg-emerald-500 h-full transition-all duration-300"
                            title={`Consumed: ${consumedQty.toLocaleString()} KG (${consumedPct}%)`}
                        />
                        <div
                            style={{ width: `${remainingPct}%` }}
                            className="bg-blue-500 h-full transition-all duration-300"
                            title={`Remaining: ${remainingQty.toLocaleString()} KG (${remainingPct}%)`}
                        />
                    </div>
                </div>
            </div>

            {/* EXPANDED DRILLDOWN DETAILS */}
            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
                    {/* TRANSFERS FOR THIS BILLET */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Unit Transfers ({billet.transfers.length})
                        </h4>
                        {billet.transfers.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No transfers for this billet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {billet.transfers.map((t) => (
                                    <div key={t.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-xs">
                                        <div className="flex items-center justify-between font-bold text-slate-800">
                                            <span>
                                                {t.from_unit} → {t.to_unit}
                                            </span>
                                            <span className="text-orange-600">
                                                {Number(t.quantity).toLocaleString()} KG
                                            </span>
                                        </div>
                                        <p className="text-slate-400 mt-1">
                                            {formatDate(t.transfer_date)} {t.remarks ? `• ${t.remarks}` : ""}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PRODUCTION BATCHES */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Rolling Mill Batches & Finished Products ({billet.production.length})
                        </h4>
                        {billet.production.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No production batches have consumed this billet yet.</p>
                        ) : (
                            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                                        <tr>
                                            <th className="p-3">Batch No</th>
                                            <th className="p-3">Rolling Mill</th>
                                            <th className="p-3">Billet Consumed</th>
                                            <th className="p-3">Product Produced</th>
                                            <th className="p-3 text-right">Product Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {billet.production.map((p) => (
                                            <tr key={p.batch_id} className="hover:bg-slate-50/50 transition">
                                                <td className="p-3 font-bold text-slate-900">{p.batch_no}</td>
                                                <td className="p-3 text-slate-600">{p.unit_code}</td>
                                                <td className="p-3 font-bold text-emerald-700">
                                                    {Number(p.billet_consumed).toLocaleString()} KG
                                                </td>
                                                <td className="p-3">
                                                    {p.product_name ? (
                                                        <div>
                                                            <span className="font-semibold text-slate-800">{p.product_name}</span>
                                                            <span className="text-slate-400 ml-1">({p.product_code})</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 italic">In progress</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right font-bold text-slate-800">
                                                    {p.product_quantity ? `${Number(p.product_quantity).toLocaleString()} KG` : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {label}
            </p>
            <p className="font-bold text-slate-900 mt-1 text-sm md:text-base">
                {value}
            </p>
        </div>
    );
}

function FlowItem({
    text,
}: {
    text: string;
}) {
    return (
        <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <CircleCheck
                size={14}
                className="text-orange-400 shrink-0"
            />
            <span className="font-medium text-xs text-slate-200">
                {text}
            </span>
        </div>
    );
}

function formatDate(date: string | null | undefined): string {
    if (!date) return "-";
    try {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return String(date);
    }
}