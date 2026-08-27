"use client";

import { FormEvent, useEffect, useState } from "react";
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
    Layers
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

interface ProductionForm {
    batch_no: string;
    unit_id: number | null;
    billet_id: number | null;
    billet_consumed: number | null;
}

interface OutputForm {
    product_id: number | null;
    quantity: number | null;
}

export default function ProductionPage() {
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [products, setProducts] = useState<Product[]>([]);

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
    });

    const [outputForm, setOutputForm] = useState<OutputForm>({
        product_id: null,
        quantity: null,
    });

    // =========================
    // LOAD PRODUCTION
    // =========================
    const loadProduction = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.getProduction();
            setBatches(response.data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load production records"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD UNITS & PRODUCTS
    // =========================
    const loadUnits = async () => {
        try {
            const response = await api.getUnits();
            setUnits(response.data);
        } catch (error) {
            console.error("Failed to load units:", error);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await api.getProducts();
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    useEffect(() => {
        loadProduction();
        loadUnits();
        loadProducts();
    }, []);

    // =========================
    // CREATE PRODUCTION BATCH
    // =========================
    const handleCreateProduction = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!productionForm.batch_no || !productionForm.unit_id || !productionForm.billet_id || !productionForm.billet_consumed) {
            alert("Kripya sabhi fields bharein.");
            return;
        }

        try {
            setSaving(true);
            await api.createProduction({
                batch_no: productionForm.batch_no.trim(),
                unit_id: productionForm.unit_id,
                billet_id: productionForm.billet_id,
                billet_consumed: productionForm.billet_consumed,
            });

            setProductionForm({
                batch_no: "",
                unit_id: null,
                billet_id: null,
                billet_consumed: null,
            });

            setShowCreate(false);
            await loadProduction();
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Production batch creation failed"
            );
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
            alert("Product And Quantity fields are required.");
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
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to add production output"
            );
        } finally {
            setSaving(false);
        }
    };

    // Derived Statistics
    const totalBilletConsumed = batches.reduce(
        (sum, batch) => sum + Number(batch.billet_consumed || 0),
        0
    );
    const totalFinishedOutput = batches.reduce(
        (sum, batch) => sum + Number(batch.product_quantity || 0),
        0
    );

    return (
        <div className="p-6 space-y-6  mx-auto">
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shadow-2xs">
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
                        className="bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition shadow-2xs"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition shadow-xs"
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
                    subtitle="Total Raw Input"
                    icon={<Package size={22} />}
                />
                <SummaryCard
                    title="Finished Output"
                    value={`${totalFinishedOutput.toLocaleString("en-IN", { maximumFractionDigits: 2 })} KG`}
                    subtitle="Total Yield Dispatched"
                    icon={<Scale size={22} />}
                />
                <SummaryCard
                    title="Active Mills / Units"
                    value={new Set(batches.map((b) => b.unit_code).filter(Boolean)).size}
                    subtitle="Operating Stations"
                    icon={<Activity size={22} />}
                />
            </div>

            {/* ================================= */}
            {/* CREATE PRODUCTION FORM */}
            {/* ================================= */}
            {showCreate && (
                <form
                    onSubmit={handleCreateProduction}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200"
                >
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Launch New Production Batch
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Feed transferred cast billet stock into mill lines
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                            Input Stage
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                placeholder="e.g. WRM260825001"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
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

                        {/* BILLET ID */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Source Billet ID *
                            </label>
                            <input
                                type="number"
                                value={productionForm.billet_id ?? ""}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        billet_id: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="e.g. 101"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                                required
                            />
                        </div>

                        {/* BILLET CONSUMED */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                                Consumed Weight (KG) *
                            </label>
                            <input
                                type="number"
                                step="0.001"
                                value={productionForm.billet_consumed ?? ""}
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        billet_consumed: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="e.g. 3000.00"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-xs"
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
                            Click &quot;New Production Batch&quot; above to initialize your first mill run.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Batch Details</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Unit / Mill</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Billet In</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Product Code</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Finished Output</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {batches.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-orange-50/30 transition-colors">
                                        {/* BATCH */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-orange-600 font-mono">
                                                {batch.batch_no}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                ID: #{batch.id}
                                            </div>
                                        </td>

                                        {/* UNIT */}
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900 bg-slate-100 px-2.5 py-1 rounded text-xs">
                                                {batch.unit_code}
                                            </span>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {batch.unit_name}
                                            </div>
                                        </td>

                                        {/* DATE */}
                                        <td className="px-6 py-4 text-slate-600 text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                <Calendar size={13} className="text-slate-400" />
                                                {formatDate(batch.production_date)}
                                            </div>
                                        </td>

                                        {/* BILLET CONSUMED */}
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900">
                                                {Number(batch.billet_consumed || 0).toLocaleString()}
                                            </span>
                                            <span className="text-xs text-slate-500 ml-1 font-medium">KG</span>
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
                                                <span className="text-xs italic text-slate-400 bg-slate-50 border border-dashed border-slate-200 px-2.5 py-1 rounded-md">
                                                    Pending Output
                                                </span>
                                            )}
                                        </td>

                                        {/* OUTPUT */}
                                        <td className="px-6 py-4">
                                            {batch.product_quantity ? (
                                                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md font-semibold text-xs">
                                                    <CheckCircle2 size={13} className="text-emerald-600" />
                                                    {Number(batch.product_quantity).toLocaleString()} KG
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">-</span>
                                            )}
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
                                ))}
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
                                <span className="bg-white px-2 py-1 rounded shadow-2xs border border-orange-200">
                                    Unit: {selectedBatch.unit_code}
                                </span>
                                <ArrowRight size={14} className="text-orange-500" />
                                <span className="bg-white px-2 py-1 rounded shadow-2xs border border-orange-200">
                                    Input: {Number(selectedBatch.billet_consumed || 0).toLocaleString()} KG
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
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
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
                                min="0"
                                value={outputForm.quantity ?? ""}
                                onChange={(e) =>
                                    setOutputForm({
                                        ...outputForm,
                                        quantity: e.target.value ? Number(e.target.value) : null,
                                    })
                                }
                                placeholder="e.g. 2850.50"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                                required
                            />
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
                                className="w-1/2 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-xs"
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