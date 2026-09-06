"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
    Activity,
    CheckCircle2,
    Factory,
    Package,
    Plus,
    RefreshCw,
    X,
    ArrowRight,
    Scale,
    Calendar,
    Layers,
    TrendingUp,
} from "lucide-react";

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
    const [error, setError] = useState("");

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

    // =========================
    // LOAD DATA
    // =========================
    const loadProduction = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.getProduction();
            setBatches(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load production records");
        } finally {
            setLoading(false);
        }
    };

    const loadUnits = async () => {
        try {
            const response = await api.getUnits();
            setUnits(response.data);
        } catch (err) {
            console.error("Failed to load units:", err);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.getProducts();
            setProducts(response.data);
        } catch (err) {
            console.error("Failed to load products:", err);
        }
    };

    const loadBillets = async () => {
        try {
            const response = await api.getBillets();
            setBillets(response.data);
        } catch (err) {
            console.error("Failed to load billets:", err);
        }
    };

    useEffect(() => {
        loadProduction();
        loadUnits();
        loadProducts();
        loadBillets();
    }, []);

    // Handle Billet selection in Create form
    const handleBilletSelect = (billetIdStr: string) => {
        const id = billetIdStr ? Number(billetIdStr) : null;
        const selected = billets.find((b) => b.id === id);

        setProductionForm((prev) => ({
            ...prev,
            billet_id: id,
            billet_consumed: selected ? Number(selected.remaining_quantity ?? selected.quantity) : null,
        }));
    };

    // =========================
    // CREATE PRODUCTION BATCH
    // =========================
    const handleCreateProduction = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!productionForm.batch_no || !productionForm.unit_id) {
            alert("Batch number and unit are required.");
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
            await Promise.all([loadProduction(), loadBillets()]);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Production batch creation failed");
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // ADD PRODUCT OUTPUT
    // =========================
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

            setOutputForm({
                product_id: null,
                quantity: null,
            });

            setShowOutput(false);
            await loadProduction();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unable to add production output");
        } finally {
            setSaving(false);
        }
    };

    // Derived Statistics
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

    return (
        <div className="p-6 space-y-6 mx-auto">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                        <Factory className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                            Rolling Mill & Production
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Track billet consumption, rolling batches, and finished product outputs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadProduction}
                        className="bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition"
                    >
                        {showCreate ? <X size={18} /> : <Plus size={18} />}
                        {showCreate ? "Close" : "New Production Batch"}
                    </button>
                </div>
            </div>

            {/* ================================= */}
            {/* ERROR BANNER */}
            {/* ================================= */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">✕</button>
                </div>
            )}

            {/* ================================= */}
            {/* SUMMARY CARDS */}
            {/* ================================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    title="Total Batches"
                    value={batches.length}
                    subtitle="Logged Rolling Runs"
                    icon={<Layers size={22} />}
                />
                <SummaryCard
                    title="Billet Consumed"
                    value={`${totalBilletConsumed.toLocaleString("en-IN", { maximumFractionDigits: 2 })} KG`}
                    subtitle="Total Raw Input Fed"
                    icon={<Package size={22} />}
                />
                <SummaryCard
                    title="Finished Output"
                    value={`${totalFinishedOutput.toLocaleString("en-IN", { maximumFractionDigits: 2 })} KG`}
                    subtitle="Total Prime Yield"
                    icon={<Scale size={22} />}
                />
                <SummaryCard
                    title="Rolling Yield"
                    value={`${overallYield}%`}
                    subtitle="Material Conversion Rate"
                    icon={<TrendingUp size={22} />}
                />
            </div>

            {/* ================================= */}
            {/* CREATE PRODUCTION FORM */}
            {/* ================================= */}
            {showCreate && (
                <form
                    onSubmit={handleCreateProduction}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5"
                >
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Launch New Production Batch
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Feed transferred cast billet stock into rolling mill lines
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                            Input Stage
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* BATCH NO */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Batch Number *
                            </label>
                            <input
                                type="text"
                                value={productionForm.batch_no}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        batch_no: e.target.value,
                                    })
                                }
                                placeholder="e.g. WRM260825002"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 text-sm transition"
                                required
                            />
                        </div>

                        {/* UNIT */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Production Mill / Unit *
                            </label>
                            <select
                                value={productionForm.unit_id ?? ""}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        unit_id: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500 text-sm transition"
                                required
                            >
                                <option value="">-- Choose Mill Line --</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_code} - {unit.unit_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PRODUCTION DATE */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Production Date *
                            </label>
                            <input
                                type="date"
                                value={productionForm.production_date}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        production_date: e.target.value,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 text-sm transition"
                                required
                            />
                        </div>

                        {/* SOURCE BILLET DROPDOWN */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Source Billet *
                            </label>
                            <select
                                value={productionForm.billet_id ?? ""}
                                onChange={(e) => handleBilletSelect(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500 text-sm transition"
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
                                    Heat: <span className="font-semibold text-orange-600">{selectedBilletObj.heat_no}</span> • Grade: {selectedBilletObj.grade_code} • Balance: {Number(selectedBilletObj.remaining_quantity ?? selectedBilletObj.quantity).toLocaleString()} KG
                                </p>
                            )}
                        </div>

                        {/* BILLET CONSUMED WEIGHT */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Consumed Weight (KG) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={productionForm.billet_consumed ?? ""}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        billet_consumed: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="e.g. 3000.00"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 text-sm transition"
                                required
                            />
                        </div>

                        {/* REMARKS */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Remarks / Notes
                            </label>
                            <input
                                type="text"
                                value={productionForm.remarks}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        remarks: e.target.value,
                                    })
                                }
                                placeholder="e.g. Rolling pass 1, 12mm rebar run"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 text-sm transition"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
                        >
                            {saving ? "Creating Batch..." : "Create Production Batch"}
                        </button>
                    </div>
                </form>
            )}

            {/* ================================= */}
            {/* PRODUCTION TABLE */}
            {/* ================================= */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="font-bold text-slate-900">Production Batches History</h2>
                        <p className="text-xs text-slate-500">
                            Raw billet consumption linked directly to finished rolled outputs
                        </p>
                    </div>
                    <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-md text-xs font-semibold w-fit">
                        {batches.length} Batches
                    </span>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
                        <RefreshCw size={24} className="animate-spin text-orange-500" />
                        <span>Loading production records...</span>
                    </div>
                ) : batches.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Factory size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">No production batches found</h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                            Click &quot;New Production Batch&quot; to feed billets into rolling and start a production run.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Batch No</th>
                                    <th className="px-6 py-3.5">Mill Line</th>
                                    <th className="px-6 py-3.5">Date</th>
                                    <th className="px-6 py-3.5">Source Billet</th>
                                    <th className="px-6 py-3.5">Billet Consumed</th>
                                    <th className="px-6 py-3.5">Finished Product</th>
                                    <th className="px-6 py-3.5">Yield Output</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {batches.map((batch) => {
                                    const inputQty = Number(batch.billet_consumed || batch.input_quantity || 0);
                                    const outputQty = Number(batch.product_quantity || batch.output_quantity || 0);
                                    const yieldPct = inputQty > 0 && outputQty > 0
                                        ? ((outputQty / inputQty) * 100).toFixed(1)
                                        : null;

                                    return (
                                        <tr key={batch.id} className="hover:bg-slate-50/70 transition">
                                            {/* BATCH NO */}
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {batch.batch_no}
                                            </td>

                                            {/* UNIT */}
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-800">{batch.unit_code}</span>
                                                <p className="text-xs text-slate-400">{batch.unit_name}</p>
                                            </td>

                                            {/* DATE */}
                                            <td className="px-6 py-4 text-slate-600 text-xs">
                                                {formatDate(batch.production_date)}
                                            </td>

                                            {/* SOURCE BILLET */}
                                            <td className="px-6 py-4">
                                                {batch.billet_no ? (
                                                    <Link
                                                        href={`/dashboard/traceability?billet=${encodeURIComponent(batch.billet_no)}`}
                                                        className="inline-flex items-center gap-1 font-semibold text-orange-600 hover:text-orange-800 hover:underline text-xs bg-orange-50 px-2 py-0.5 rounded border border-orange-200"
                                                        title="Click to trace billet"
                                                    >
                                                        <span>{batch.billet_no}</span>
                                                        <span>→</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Direct Mill Feed</span>
                                                )}
                                            </td>

                                            {/* BILLET CONSUMED */}
                                            <td className="px-6 py-4 font-bold text-slate-900">
                                                {inputQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">KG</span>
                                            </td>

                                            {/* PRODUCT */}
                                            <td className="px-6 py-4">
                                                {batch.product_name ? (
                                                    <div>
                                                        <p className="font-semibold text-slate-900">
                                                            {batch.product_name}
                                                        </p>
                                                        <p className="text-xs font-mono text-orange-600">
                                                            {batch.product_code}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs italic text-slate-400 bg-slate-50 border border-dashed border-slate-200 px-2 py-0.5 rounded">
                                                        Pending Output
                                                    </span>
                                                )}
                                            </td>

                                            {/* OUTPUT */}
                                            <td className="px-6 py-4">
                                                {outputQty > 0 ? (
                                                    <div>
                                                        <span className="font-bold text-emerald-700">
                                                            {outputQty.toLocaleString()} KG
                                                        </span>
                                                        {yieldPct && (
                                                            <p className="text-[11px] text-emerald-600 font-medium">
                                                                Yield: {yieldPct}%
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">-</span>
                                                )}
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        batch.status === "COMPLETED"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-amber-100 text-amber-800"
                                                    }`}
                                                >
                                                    {batch.status}
                                                </span>
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBatch(batch);
                                                        setShowOutput(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-500 hover:text-white rounded-lg text-xs font-semibold transition"
                                                >
                                                    <Plus size={14} />
                                                    Add Output
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ================================= */}
            {/* OUTPUT MODAL */}
            {/* ================================= */}
            {showOutput && selectedBatch && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <form
                        onSubmit={handleAddOutput}
                        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Record Product Output
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Batch Ref: <span className="font-bold text-orange-600 font-mono">{selectedBatch.batch_no}</span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowOutput(false)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FLOW STEP BANNER */}
                        <div className="bg-orange-50/60 border border-orange-200/80 rounded-xl p-3">
                            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-700">
                                <span className="bg-white px-2 py-1 rounded border border-orange-200">
                                    Mill: {selectedBatch.unit_code}
                                </span>
                                <ArrowRight size={14} className="text-orange-500" />
                                <span className="bg-white px-2 py-1 rounded border border-orange-200">
                                    Input: {Number(selectedBatch.billet_consumed || selectedBatch.input_quantity || 0).toLocaleString()} KG
                                </span>
                            </div>
                        </div>

                        {/* PRODUCT SELECT */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Select Finished Product *
                            </label>
                            <select
                                value={outputForm.product_id ?? ""}
                                onChange={(e) =>
                                    setOutputForm({
                                        ...outputForm,
                                        product_id: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500 text-sm transition"
                                required
                            >
                                <option value="">-- Choose Product --</option>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.product_code} - {product.product_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* QUANTITY */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Finished Yield Weight (KG) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={outputForm.quantity ?? ""}
                                onChange={(e) =>
                                    setOutputForm({
                                        ...outputForm,
                                        quantity: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="e.g. 2850.50"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 text-sm transition"
                                required
                            />
                            {outputForm.quantity && selectedBatch && (
                                <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                                    Yield: {(((Number(outputForm.quantity) / (Number(selectedBatch.billet_consumed || selectedBatch.input_quantity || 1))) * 100).toFixed(1))}% • Scrap Loss: {Math.max(0, Number(selectedBatch.billet_consumed || selectedBatch.input_quantity || 0) - Number(outputForm.quantity)).toFixed(1)} KG
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowOutput(false)}
                                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-1/2 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
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

// =================================
// SUMMARY CARD COMPONENT
// =================================
function SummaryCard({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
                </div>

                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// =================================
// DATE FORMATTER HELPER
// =================================
function formatDate(date: string) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}