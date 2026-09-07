"use client";

import { FormEvent, useEffect, useState } from "react";
import {
    ArrowRight,
    ArrowRightLeft,
    CheckCircle2,
    Clock,
    Plus,
    RefreshCw,
    X,
    Boxes,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import { api, Unit, Transfer } from "../../../lib/api";

interface CreateTransfer {
    billet_id: number | null;
    from_unit_id: number | null;
    to_unit_id: number | null;
    quantity: number | null;
    transfer_type: string;
    remarks: string;
}

export default function TransfersPage() {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [billets, setBillets] = useState<Array<{ id: number; billet_no: string; quantity: number | string; remaining_quantity?: number; heat_no: string; grade_code: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState<CreateTransfer>({
        billet_id: null,
        from_unit_id: null,
        to_unit_id: null,
        quantity: null,
        transfer_type: "TRANSFER",
        remarks: "",
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [transfersRes, unitsRes, billetsRes] = await Promise.all([
                api.getTransfers().catch(() => ({ data: [] })),
                api.getUnits().catch(() => ({ data: [] })),
                api.getBillets().catch(() => ({ data: [] })),
            ]);

            setTransfers(transfersRes?.data || []);
            setUnits(unitsRes?.data || []);
            setBillets(billetsRes?.data || []);
        } catch (error) {
            console.error("Failed to load transfers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.billet_id === null || form.from_unit_id === null || form.to_unit_id === null || form.quantity === null) {
            alert("Please fill in all required fields (Billet, From Unit, To Unit, Quantity)");
            return;
        }

        try {
            setSaving(true);
            await api.createTransfer({
                billet_id: form.billet_id,
                from_unit_id: form.from_unit_id,
                to_unit_id: form.to_unit_id,
                quantity: form.quantity,
                transfer_type: form.transfer_type,
                remarks: form.remarks,
            });

            setForm({
                billet_id: null,
                from_unit_id: null,
                to_unit_id: null,
                quantity: null,
                transfer_type: "TRANSFER",
                remarks: "",
            });

            setShowForm(false);
            await loadData();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Transfer creation failed");
        } finally {
            setSaving(false);
        }
    };

    // Derived statistics
    const totalTransfers = transfers.length;
    const totalQuantityTransferred = transfers.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
    const completedCount = transfers.filter((item) => item.transfer_type === "TRANSFER").length;

    const filteredTransfers = transfers.filter((t) =>
        (t.billet_no && t.billet_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.from_unit && t.from_unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.to_unit && t.to_unit.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.remarks && t.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <PageHeader
                title="Material Transfers & Unit Logistics"
                subtitle="Track cast billet movement between SMS furnace bays, stock yards, and rolling mills"
                badge="Inter-Unit Logistics"
                icon={ArrowRightLeft}
                onOpenAi={() => {}}
                aiPromptHint="show billet transfer history"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={loadData}
                            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                        >
                            <RefreshCw size={15} className={loading ? "animate-spin text-orange-500" : ""} />
                            <span>Refresh</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(!showForm)}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                            {showForm ? <X size={16} /> : <Plus size={16} />}
                            <span>{showForm ? "Close Form" : "New Transfer"}</span>
                        </button>
                    </div>
                }
            />

            {/* KPI METRIC STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Transfers"
                    value={loading ? "..." : totalTransfers}
                    subtitle="Logged material movements"
                    icon={<ArrowRightLeft size={20} />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatCard
                    title="Standard Unit Transfers"
                    value={completedCount}
                    subtitle="SMS to Mill Lines"
                    icon={<CheckCircle2 size={20} />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
                <StatCard
                    title="Total Volume Shifted"
                    value={`${(totalQuantityTransferred / 1000).toFixed(1)} MT`}
                    subtitle={`${totalQuantityTransferred.toLocaleString()} KG transferred`}
                    icon={<Boxes size={20} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
            </div>

            {/* CREATE TRANSFER FORM */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-150"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Initiate Material Transfer</h2>
                            <p className="text-xs text-slate-500">Dispatch cast billets to rolling mill staging bays</p>
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                            Unit Dispatch
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* BILLET SELECTOR */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Select Billet *
                            </label>
                            <select
                                value={form.billet_id ?? ""}
                                onChange={(e) => {
                                    const bId = e.target.value ? Number(e.target.value) : null;
                                    const chosen = billets.find((b) => b.id === bId);
                                    setForm({
                                        ...form,
                                        billet_id: bId,
                                        quantity: chosen ? Number(chosen.remaining_quantity ?? chosen.quantity) : form.quantity,
                                    });
                                }}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            >
                                <option value="">-- Choose Billet --</option>
                                {billets.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.billet_no} (Heat: {b.heat_no} | {b.grade_code}) - {Number(b.remaining_quantity ?? b.quantity).toLocaleString()} KG
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* FROM UNIT */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                From Unit *
                            </label>
                            <select
                                value={form.from_unit_id ?? ""}
                                onChange={(e) => setForm({ ...form, from_unit_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            >
                                <option value="">Select Origin Unit</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_code} - {unit.unit_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TO UNIT */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                To Unit *
                            </label>
                            <select
                                value={form.to_unit_id ?? ""}
                                onChange={(e) => setForm({ ...form, to_unit_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            >
                                <option value="">Select Destination Unit</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_code} - {unit.unit_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* QUANTITY */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Quantity (KG) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={form.quantity ?? ""}
                                onChange={(e) => setForm({ ...form, quantity: e.target.value ? Number(e.target.value) : null })}
                                placeholder="e.g. 3000"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            />
                        </div>

                        {/* TRANSFER TYPE */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Transfer Classification
                            </label>
                            <select
                                value={form.transfer_type}
                                onChange={(e) => setForm({ ...form, transfer_type: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-xs outline-none focus:border-orange-500 font-medium"
                            >
                                <option value="TRANSFER">STANDARD TRANSFER</option>
                                <option value="RETURN">MATERIAL RETURN</option>
                                <option value="ADJUSTMENT">STOCK ADJUSTMENT</option>
                            </select>
                        </div>

                        {/* REMARKS */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Movement Remarks
                            </label>
                            <input
                                type="text"
                                value={form.remarks}
                                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                                placeholder="e.g. Billet yard bay 2 to WRM furnace inlet"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {saving ? "Creating Transfer..." : "Confirm Material Transfer"}
                        </button>
                    </div>
                </form>
            )}

            {/* TRANSFERS TABLE CONTAINER */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-extrabold text-sm text-slate-900">Material Movement Log</h3>
                        <p className="text-xs text-slate-500">Historical dispatch and receipt log across all units</p>
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search transfers, units, billets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-100 transition"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                            <tr>
                                <th className="p-3.5 pl-6">ID</th>
                                <th className="p-3.5">Billet Item</th>
                                <th className="p-3.5">Transit Movement</th>
                                <th className="p-3.5">Weight (KG)</th>
                                <th className="p-3.5">Type</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5 pr-6">Remarks</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredTransfers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                        {loading ? "Loading transfer records..." : "No material transfers found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredTransfers.map((t) => (
                                    <tr key={t.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="p-3.5 pl-6 text-slate-400 font-mono">
                                            #{t.id}
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-900">
                                            {t.billet_no ? (
                                                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-mono">
                                                    {t.billet_no}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">Billet #{t.billet_id ?? "-"}</span>
                                            )}
                                        </td>
                                        <td className="p-3.5">
                                            <div className="flex items-center gap-2 font-bold text-slate-800">
                                                <span>{t.from_unit}</span>
                                                <ArrowRight size={14} className="text-orange-500 shrink-0" />
                                                <span className="text-emerald-700">{t.to_unit}</span>
                                            </div>
                                        </td>
                                        <td className="p-3.5 font-extrabold text-slate-900">
                                            {Number(t.quantity).toLocaleString()} KG
                                        </td>
                                        <td className="p-3.5">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                                {t.transfer_type}
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-slate-600">
                                            {new Date(t.transfer_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-3.5 pr-6 text-slate-500">
                                            {t.remarks || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}