"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
    Factory,
    Package,
    Plus,
    RefreshCw,
    X,
    ArrowRight,
    Scale,
    Layers,
    TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import { api } from "../../../lib/api";

export interface ProductionBatch {
    id: number;
    batch_no: string;
    unit_code: string;
    unit_name: string;
    production_date: string;
    input_quantity: string;
    output_quantity: string;
    unit: string;
    status: string;
    remarks: string | null;
    billet_id?: number | null;
    billet_no?: string | null;
    billet_consumed: string | null;
    product_code: string | null;
    product_name: string | null;
    product_type: string | null;
    product_quantity: string | null;
}

interface Unit {
    id: number;
    unit_code: string;
    unit_name: string;
}

interface Product {
    id: number;
    product_code: string;
    product_name: string | null;
    product_type: string | null;
}

interface BilletOption {
    id: number;
    billet_no: string;
    quantity: number | string;
    remaining_quantity?: number;
    heat_no: string;
    grade_code: string;
    status: string;
}

interface ProductionForm {
    batch_no: string;
    unit_id: number | null;
    billet_id: number | null;
    billet_consumed: number | null;
    production_date: string;
    remarks: string;
}

interface OutputForm {
    product_id: number | null;
    quantity: number | null;
}

export default function ProductionPage() {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [billets, setBillets] = useState<BilletOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [productionForm, setProductionForm] = useState<ProductionForm>({
        batch_no: "",
        unit_id: null,
        billet_id: null,
        billet_consumed: null,
        production_date: new Date().toISOString().split("T")[0],
        remarks: "",
    });

    const [outputForm, setOutputForm] = useState<OutputForm>({
        product_id: null,
        quantity: null,
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [prodRes, unitsRes, prodCatalogRes, billetsRes] = await Promise.all([
                api.getProduction().catch(() => ({ data: [] })),
                api.getUnits().catch(() => ({ data: [] })),
                api.getProducts().catch(() => ({ data: [] })),
                api.getBillets().catch(() => ({ data: [] })),
            ]);

            setBatches(prodRes.data || []);
            setUnits(unitsRes.data || []);
            setProducts(prodCatalogRes.data || []);
            setBillets(billetsRes.data || []);
        } catch (err) {
            console.error("Failed to load production data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleBilletSelect = (billetIdStr: string) => {
        const id = billetIdStr ? Number(billetIdStr) : null;
        const selected = billets.find((b) => b.id === id);

        setProductionForm((prev) => ({
            ...prev,
            billet_id: id,
            billet_consumed: selected ? Number(selected.remaining_quantity ?? selected.quantity) : null,
        }));
    };

    const handleCreateProduction = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!productionForm.batch_no || !productionForm.unit_id) {
            alert("Batch number and mill unit are required.");
            return;
        }

        try {
            setSaving(true);
            await api.createProduction({
                batch_no: productionForm.batch_no.trim(),
                unit_id: productionForm.unit_id,
                billet_id: productionForm.billet_id,
                billet_consumed: productionForm.billet_consumed,
                production_date: productionForm.production_date,
                remarks: productionForm.remarks.trim() || null,
            });

            setProductionForm({
                batch_no: "",
                unit_id: null,
                billet_id: null,
                billet_consumed: null,
                production_date: new Date().toISOString().split("T")[0],
                remarks: "",
            });

            setShowCreate(false);
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Production batch creation failed");
        } finally {
            setSaving(false);
        }
    };

    const handleAddOutput = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedBatch || !outputForm.product_id || !outputForm.quantity) {
            alert("Product and quantity fields are required.");
            return;
        }

        try {
            setSaving(true);
            await api.addProductionOutput(selectedBatch.id, {
                product_id: outputForm.product_id,
                quantity: outputForm.quantity,
            });

            setOutputForm({ product_id: null, quantity: null });
            setShowOutput(false);
            await loadData();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unable to add production output");
        } finally {
            setSaving(false);
        }
    };

    // Metrics
    const totalBilletConsumed = batches.reduce(
        (sum, b) => sum + Number(b.billet_consumed || b.input_quantity || 0),
        0
    );
    const totalFinishedOutput = batches.reduce(
        (sum, b) => sum + Number(b.product_quantity || b.output_quantity || 0),
        0
    );
    const overallYield = totalBilletConsumed > 0
        ? ((totalFinishedOutput / totalBilletConsumed) * 100).toFixed(1)
        : "100.0";

    const selectedBilletObj = billets.find((b) => b.id === productionForm.billet_id);

    const filteredBatches = batches.filter((b) =>
        b.batch_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.product_name && b.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.billet_no && b.billet_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.unit_code && b.unit_code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <PageHeader
                title="Rolling Mill Production & Outputs"
                subtitle="Track cast billet consumption, rolling campaigns, and finished rebar/wire rod outputs"
                badge="Rolling Mill MES"
                icon={Factory}
                onOpenAi={() => {}}
                aiPromptHint="what product built production like ui"
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
                            onClick={() => setShowCreate(!showCreate)}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                        >
                            {showCreate ? <X size={16} /> : <Plus size={16} />}
                            <span>{showCreate ? "Close Form" : "New Rolling Batch"}</span>
                        </button>
                    </div>
                }
            />

            {/* KPI METRIC STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Batches"
                    value={loading ? "..." : batches.length}
                    subtitle="Logged hot rolling runs"
                    icon={<Layers size={20} />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatCard
                    title="Billet Consumed"
                    value={`${totalBilletConsumed.toLocaleString()} KG`}
                    subtitle="Total raw input fed to mill"
                    icon={<Package size={20} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatCard
                    title="Finished Output"
                    value={`${totalFinishedOutput.toLocaleString()} KG`}
                    subtitle="Total prime finished yield"
                    icon={<Scale size={20} />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
                <StatCard
                    title="Rolling Yield Rate"
                    value={`${overallYield}%`}
                    subtitle="Material conversion efficiency"
                    icon={<TrendingUp size={20} />}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                />
            </div>

            {/* CREATE PRODUCTION BATCH FORM */}
            {showCreate && (
                <form
                    onSubmit={handleCreateProduction}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-150"
                >
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Launch New Production Batch</h2>
                            <p className="text-xs text-slate-500">Feed transferred billet stock into rolling mill lines</p>
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                            Mill Feed
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Batch Number *
                            </label>
                            <input
                                type="text"
                                value={productionForm.batch_no}
                                onChange={(e) => setProductionForm({ ...productionForm, batch_no: e.target.value })}
                                placeholder="e.g. WRM260825002"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Production Mill Line *
                            </label>
                            <select
                                value={productionForm.unit_id ?? ""}
                                onChange={(e) => setProductionForm({ ...productionForm, unit_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            >
                                <option value="">-- Choose Mill Line --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.unit_code} - {u.unit_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Production Date *
                            </label>
                            <input
                                type="date"
                                value={productionForm.production_date}
                                onChange={(e) => setProductionForm({ ...productionForm, production_date: e.target.value })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Source Billet *
                            </label>
                            <select
                                value={productionForm.billet_id ?? ""}
                                onChange={(e) => handleBilletSelect(e.target.value)}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            >
                                <option value="">-- Select Source Billet --</option>
                                {billets.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.billet_no} (Heat: {b.heat_no} | {b.grade_code}) - Avail: {Number(b.remaining_quantity ?? b.quantity).toLocaleString()} KG
                                    </option>
                                ))}
                            </select>
                            {selectedBilletObj && (
                                <p className="text-[11px] text-slate-500 mt-1">
                                    Heat: <strong className="text-orange-600">{selectedBilletObj.heat_no}</strong> • Grade: {selectedBilletObj.grade_code}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Consumed Weight (KG) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={productionForm.billet_consumed ?? ""}
                                onChange={(e) => setProductionForm({ ...productionForm, billet_consumed: e.target.value ? Number(e.target.value) : null })}
                                placeholder="e.g. 3000.00"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-500 font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Remarks / Run Notes
                            </label>
                            <input
                                type="text"
                                value={productionForm.remarks}
                                onChange={(e) => setProductionForm({ ...productionForm, remarks: e.target.value })}
                                placeholder="e.g. 12mm rebar rolling campaign"
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
                            {saving ? "Creating Batch..." : "Create Production Batch"}
                        </button>
                    </div>
                </form>
            )}

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-extrabold text-sm text-slate-900">Production Batches History</h3>
                        <p className="text-xs text-slate-500">Raw billet consumption linked directly to finished rolled outputs</p>
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search batches, billets, products..."
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
                                <th className="p-3.5 pl-6">Batch No</th>
                                <th className="p-3.5">Mill Line</th>
                                <th className="p-3.5">Date</th>
                                <th className="p-3.5">Source Billet</th>
                                <th className="p-3.5">Billet Consumed</th>
                                <th className="p-3.5">Finished Product</th>
                                <th className="p-3.5">Yield Output</th>
                                <th className="p-3.5">Status</th>
                                <th className="p-3.5 pr-6 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredBatches.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-slate-400">
                                        {loading ? "Loading rolling mill records..." : "No production batches found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredBatches.map((batch) => {
                                    const inputQty = Number(batch.billet_consumed || batch.input_quantity || 0);
                                    const outputQty = Number(batch.product_quantity || batch.output_quantity || 0);
                                    const yieldPct = inputQty > 0 && outputQty > 0
                                        ? ((outputQty / inputQty) * 100).toFixed(1)
                                        : null;

                                    return (
                                        <tr key={batch.id} className="hover:bg-orange-50/30 transition-colors">
                                            <td className="p-3.5 pl-6 font-extrabold text-slate-900">
                                                {batch.batch_no}
                                            </td>
                                            <td className="p-3.5">
                                                <span className="font-bold text-slate-800">{batch.unit_code}</span>
                                                <p className="text-[11px] text-slate-400">{batch.unit_name}</p>
                                            </td>
                                            <td className="p-3.5 text-slate-600">
                                                {new Date(batch.production_date).toLocaleDateString()}
                                            </td>
                                            <td className="p-3.5">
                                                {batch.billet_no ? (
                                                    <Link
                                                        href={`/dashboard/traceability?billet=${encodeURIComponent(batch.billet_no)}`}
                                                        className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-800 hover:underline bg-orange-50 px-2 py-0.5 rounded border border-orange-200"
                                                        title="Click to trace billet"
                                                    >
                                                        <span>{batch.billet_no}</span>
                                                        <span>→</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400">Direct Mill Feed</span>
                                                )}
                                            </td>
                                            <td className="p-3.5 font-bold text-slate-900">
                                                {inputQty.toLocaleString()} KG
                                            </td>
                                            <td className="p-3.5">
                                                {batch.product_name ? (
                                                    <div>
                                                        <p className="font-bold text-slate-900">{batch.product_name}</p>
                                                        <p className="text-[11px] text-orange-600 font-mono">{batch.product_code}</p>
                                                    </div>
                                                ) : (
                                                    <span className="italic text-slate-400 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                                        Pending Output
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3.5">
                                                {outputQty > 0 ? (
                                                    <div>
                                                        <span className="font-extrabold text-emerald-700">
                                                            {outputQty.toLocaleString()} KG
                                                        </span>
                                                        {yieldPct && (
                                                            <p className="text-[10px] text-emerald-600 font-bold">
                                                                Yield: {yieldPct}%
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-3.5">
                                                <span
                                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        batch.status === "COMPLETED"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-amber-100 text-amber-800"
                                                    }`}
                                                >
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="p-3.5 pr-6 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedBatch(batch);
                                                        setShowOutput(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
                                                >
                                                    <Plus size={13} />
                                                    Add Output
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* OUTPUT MODAL */}
            {showOutput && selectedBatch && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <form
                        onSubmit={handleAddOutput}
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Record Finished Product Output</h2>
                                <p className="text-xs text-slate-500">
                                    Batch Ref: <span className="font-bold text-orange-600">{selectedBatch.batch_no}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOutput(false)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FLOW STEP BANNER */}
                        <div className="bg-orange-50/60 border border-orange-200 rounded-xl p-3 text-xs font-semibold text-slate-700 flex items-center justify-center gap-3">
                            <span className="bg-white px-2 py-1 rounded border border-orange-200">
                                Mill: {selectedBatch.unit_code}
                            </span>
                            <ArrowRight size={14} className="text-orange-500" />
                            <span className="bg-white px-2 py-1 rounded border border-orange-200">
                                Input: {Number(selectedBatch.billet_consumed || selectedBatch.input_quantity || 0).toLocaleString()} KG
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Select Finished Product *
                            </label>
                            <select
                                value={outputForm.product_id ?? ""}
                                onChange={(e) => setOutputForm({ ...outputForm, product_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white text-sm outline-none focus:border-orange-500 font-medium"
                                required
                            >
                                <option value="">-- Choose Product --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.product_code} - {p.product_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Finished Output Weight (KG) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={outputForm.quantity ?? ""}
                                onChange={(e) => setOutputForm({ ...outputForm, quantity: e.target.value ? Number(e.target.value) : null })}
                                placeholder="e.g. 2850.50"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 font-medium"
                                required
                            />
                            {outputForm.quantity && selectedBatch && (
                                <p className="text-xs text-emerald-700 mt-1.5 font-bold">
                                    Yield: {(((Number(outputForm.quantity) / (Number(selectedBatch.billet_consumed || selectedBatch.input_quantity || 1))) * 100).toFixed(1))}% • Scale Loss: {Math.max(0, Number(selectedBatch.billet_consumed || selectedBatch.input_quantity || 0) - Number(outputForm.quantity)).toFixed(1)} KG
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowOutput(false)}
                                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-1/2 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                                {saving ? "Saving Output..." : "Confirm Output"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}