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
    product_type: string|null;
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

    const [selectedBatch, setSelectedBatch] =
        useState<ProductionBatch | null>(null);

    const [error, setError] = useState("");

    const [productionForm, setProductionForm] =
        useState<ProductionForm>({
            batch_no: "",
            unit_id: null,
            billet_id: null,
            billet_consumed: null,
        });

    const [outputForm, setOutputForm] =
        useState<OutputForm>({
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
                    : "Unable to load production"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD UNITS
    // =========================

    const loadUnits = async () => {
        try {
            const response = await api.getUnits();

            setUnits(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // LOAD PRODUCTS
    // =========================

    const loadProducts = async () => {
        try {
            const response = await api.getProducts();

            setProducts(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadProduction();
        loadUnits();
        loadProducts();
    }, []);

    // =========================
    // CREATE PRODUCTION
    // =========================

    const handleCreateProduction = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!productionForm.batch_no) {
            alert("Batch number is required");
            return;
        }

        if (!productionForm.unit_id) {
            alert("Unit is required");
            return;
        }

        if (!productionForm.billet_id) {
            alert("Billet ID is required");
            return;
        }

        if (!productionForm.billet_consumed) {
            alert("Billet consumed quantity is required");
            return;
        }

        try {
            setSaving(true);

            await api.createProduction({
                batch_no: productionForm.batch_no,
                unit_id: productionForm.unit_id,
                billet_id: productionForm.billet_id,
                billet_consumed: productionForm.billet_consumed,
            });

            alert("Production batch created successfully");

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
                    : "Production creation failed"
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // ADD PRODUCT OUTPUT
    // =========================

    const handleAddOutput = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!selectedBatch) {
            return;
        }

        if (!outputForm.product_id) {
            alert("Product is required");
            return;
        }

        if (!outputForm.quantity) {
            alert("Quantity is required");
            return;
        }

        try {
            setSaving(true);

            await api.addProductionOutput(
                selectedBatch.id,
                {
                    product_id: outputForm.product_id,
                    quantity: outputForm.quantity,
                }
            );

            alert("Production output added successfully");

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

    return (
        <div>
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Factory
                                size={25}
                                className="text-orange-500"
                            />
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Production
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Manage production batches and product outputs
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={loadProduction}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowCreate(!showCreate)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
                    >
                        {showCreate ? (
                            <X size={18} />
                        ) : (
                            <Plus size={18} />
                        )}

                        {showCreate
                            ? "Close"
                            : "New Production"}
                    </button>
                </div>
            </div>

            {/* ================================= */}
            {/* ERROR */}
            {/* ================================= */}

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl">
                    {error}
                </div>
            )}

            {/* ================================= */}
            {/* CREATE PRODUCTION FORM */}
            {/* ================================= */}

            {showCreate && (
                <form
                    onSubmit={handleCreateProduction}
                    className="bg-white border rounded-2xl p-6 mb-6"
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-bold">
                            Create Production Batch
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Create a production batch from transferred billet
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* BATCH NO */}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Batch No
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
                                placeholder="WRM260825001"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        {/* UNIT */}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Production Unit
                            </label>

                            <select
                                value={
                                    productionForm.unit_id ?? ""
                                }
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        unit_id: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500"
                                required
                            >
                                <option value="">
                                    Select Unit
                                </option>

                                {units.map((unit) => (
                                    <option
                                        key={unit.id}
                                        value={unit.id}
                                    >
                                        {unit.unit_code} -{" "}
                                        {unit.unit_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* BILLET ID */}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Billet ID
                            </label>

                            <input
                                type="number"
                                value={
                                    productionForm.billet_id ?? ""
                                }
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        billet_id: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                placeholder="Example: 1"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        {/* BILLET CONSUMED */}

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Billet Consumed (KG)
                            </label>

                            <input
                                type="number"
                                step="0.001"
                                value={
                                    productionForm.billet_consumed ?? ""
                                }
                                onChange={(e) =>
                                    setProductionForm({
                                        ...productionForm,
                                        billet_consumed: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                placeholder="3000"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-lg font-semibold disabled:opacity-50"
                        >
                            {saving
                                ? "Creating..."
                                : "Create Batch"}
                        </button>
                    </div>
                </form>
            )}

            {/* ================================= */}
            {/* SUMMARY */}
            {/* ================================= */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <SummaryCard
                    title="Total Batches"
                    value={batches.length}
                    icon={<Factory size={22} />}
                />

                <SummaryCard
                    title="Billet Consumed"
                    value={`${batches
                        .reduce(
                            (sum, batch) =>
                                sum +
                                Number(
                                    batch.billet_consumed || 0
                                ),
                            0
                        )
                        .toFixed(2)} KG`}
                    icon={<Package size={22} />}
                />

                <SummaryCard
                    title="Product Outputs"
                    value={
                        batches.filter(
                            (batch) =>
                                batch.product_name
                        ).length
                    }
                    icon={
                        <CheckCircle2 size={22} />
                    }
                />

                <SummaryCard
                    title="Active Units"
                    value={
                        new Set(
                            batches.map(
                                (batch) =>
                                    batch.unit_code
                            )
                        ).size
                    }
                    icon={<Activity size={22} />}
                />
            </div>

            {/* ================================= */}
            {/* PRODUCTION TABLE */}
            {/* ================================= */}

            <div className="bg-white border rounded-2xl overflow-hidden">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">
                        Production Batches
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Track billet consumption and final product output
                    </p>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Loading production...
                    </div>
                ) : batches.length === 0 ? (
                    <div className="p-12 text-center">
                        <Factory
                            size={45}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-4 font-semibold">
                            No production batches found
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Create your first production batch.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Batch
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Unit
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Production Date
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Billet Consumed
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Product
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Output
                                    </th>

                                    <th className="text-right px-6 py-4 text-sm font-semibold">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {batches.map((batch) => (
                                    <tr
                                        key={batch.id}
                                        className="border-t hover:bg-slate-50"
                                    >
                                        {/* BATCH */}

                                        <td className="px-6 py-4">
                                            <p className="font-semibold">
                                                {batch.batch_no}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                ID: {batch.id}
                                            </p>
                                        </td>

                                        {/* UNIT */}

                                        <td className="px-6 py-4">
                                            <p className="font-semibold">
                                                {batch.unit_code}
                                            </p>

                                            <p className="text-xs text-slate-500">
                                                {batch.unit_name}
                                            </p>
                                        </td>

                                        {/* DATE */}

                                        <td className="px-6 py-4 text-sm">
                                            {formatDate(
                                                batch.production_date
                                            )}
                                        </td>

                                        {/* BILLET */}

                                        <td className="px-6 py-4">
                                            <span className="font-semibold">
                                                {
                                                    batch.billet_consumed
                                                }
                                            </span>

                                            <span className="text-xs text-slate-500 ml-1">
                                                KG
                                            </span>
                                        </td>

                                        {/* PRODUCT */}

                                        <td className="px-6 py-4">
                                            {batch.product_name ? (
                                                <>
                                                    <p className="font-semibold">
                                                        {
                                                            batch.product_name
                                                        }
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        {
                                                            batch.product_code
                                                        }
                                                    </p>
                                                </>
                                            ) : (
                                                <span className="text-slate-400">
                                                    No output
                                                </span>
                                            )}
                                        </td>

                                        {/* OUTPUT */}

                                        <td className="px-6 py-4">
                                            {batch.product_quantity ? (
                                                <span className="font-semibold">
                                                    {
                                                        batch.product_quantity
                                                    }{" "}
                                                    KG
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>

                                        {/* ACTION */}

                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedBatch(
                                                        batch
                                                    );
                                                    setShowOutput(
                                                        true
                                                    );
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium"
                                            >
                                                <Plus
                                                    size={16}
                                                />

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
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <form
                        onSubmit={handleAddOutput}
                        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Add Production Output
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Batch:{" "}
                                    <span className="font-semibold">
                                        {
                                            selectedBatch.batch_no
                                        }
                                    </span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowOutput(false)
                                }
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* PRODUCT */}

                        <div className="mb-5">
                            <label className="block text-sm font-medium mb-2">
                                Product
                            </label>

                            <select
                                value={
                                    outputForm.product_id ??
                                    ""
                                }
                                onChange={(e) =>
                                    setOutputForm({
                                        ...outputForm,
                                        product_id: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500"
                                required
                            >
                                <option value="">
                                    Select Product
                                </option>

                                {products.map(
                                    (product) => (
                                        <option
                                            key={
                                                product.id
                                            }
                                            value={
                                                product.id
                                            }
                                        >
                                            {
                                                product.product_code
                                            }{" "}
                                            -{" "}
                                            {
                                                product.product_name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* QUANTITY */}

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">
                                Product Quantity (KG)
                            </label>

                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={
                                    outputForm.quantity ??
                                    ""
                                }
                                onChange={(e) =>
                                    setOutputForm({
                                        ...outputForm,
                                        quantity: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                placeholder="Example: 2850"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                required
                            />
                        </div>

                        {/* FLOW */}

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-center gap-3 text-sm font-medium">
                                <span>
                                    {selectedBatch.unit_code}
                                </span>

                                <ArrowRight
                                    size={18}
                                    className="text-orange-500"
                                />

                                <span>
                                    Product Output
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold disabled:opacity-50"
                        >
                            {saving
                                ? "Adding..."
                                : "Add Production Output"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

// =================================
// SUMMARY CARD
// =================================

function SummaryCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
}) {
    return (
        <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="text-2xl font-bold mt-1">
                        {value}
                    </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// =================================
// DATE
// =================================

function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}