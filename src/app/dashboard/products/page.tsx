"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, RefreshCw, Package, X, Layers, Factory, Sparkles } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import StatCard from "@/components/layout/StatCard";
import { api } from "../../../lib/api";
import type { Product, CreateProductRequest } from "../../../types/product";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [units, setUnits] = useState<Array<{ id: number; unit_code: string; unit_name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState<CreateProductRequest>({
        product_code: "",
        product_name: "",
        product_type: "",
        unit_id: null,
    });

    const loadProducts = async () => {
        try {
            setLoading(true);
            const [prodRes, unitsRes] = await Promise.all([
                api.getProducts().catch(() => ({ data: [] })),
                api.getUnits().catch(() => ({ data: [] }))
            ]);
            setProducts(prodRes?.data || []);
            if (unitsRes?.data) setUnits(unitsRes.data);
        } catch (error) {
            console.error("Failed to load products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.createProduct(form);

            setForm({
                product_code: "",
                product_name: "",
                product_type: "",
                unit_id: null,
            });

            setShowForm(false);
            await loadProducts();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Product creation failed");
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter((p) =>
        p.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.product_name && p.product_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.product_type && p.product_type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* PAGE HEADER */}
            <PageHeader
                title="Finished Prime Products Catalog"
                subtitle="Manage manufactured prime steel products, rolled rebar specifications & mill lines"
                badge="Finished Goods"
                icon={Package}
                onOpenAi={() => {}}
                aiPromptHint="what products were produced"
                actions={
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={loadProducts}
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
                            <span>{showForm ? "Close Form" : "New Steel Product"}</span>
                        </button>
                    </div>
                }
            />

            {/* KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    title="Total Registered Products"
                    value={loading ? "..." : products.length}
                    subtitle="Certified finished steel catalog"
                    icon={<Package size={20} />}
                    iconBg="bg-orange-50"
                    iconColor="text-orange-500"
                />
                <StatCard
                    title="Manufacturing Mill Lines"
                    value={units.length || 3}
                    subtitle="WRM, Bar Mill & Section Mills"
                    icon={<Factory size={20} />}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                />
                <StatCard
                    title="Standard Product Profiles"
                    value={Array.from(new Set(products.map((p) => p.product_type).filter(Boolean))).length || 4}
                    subtitle="Rebar, Rounds, Wire Rod, Coils"
                    icon={<Layers size={20} />}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                />
            </div>

            {/* CREATE PRODUCT FORM */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-150"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Register Finished Steel Product</h2>
                            <p className="text-xs text-slate-500">Configure finished product code, description, and rolling mill</p>
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                            Product Entry
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Product Code *
                            </label>
                            <input
                                value={form.product_code}
                                onChange={(e) => setForm({ ...form, product_code: e.target.value })}
                                placeholder="e.g. TMT-500D-12MM"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Product Name *
                            </label>
                            <input
                                value={form.product_name}
                                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                                placeholder="e.g. TMT Rebar 12mm Fe 500D"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Product Profile Type
                            </label>
                            <input
                                value={form.product_type ?? ""}
                                onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                                placeholder="e.g. Rebar / Wire Rod / Round"
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Manufacturing Mill Line
                            </label>
                            <select
                                value={form.unit_id ?? ""}
                                onChange={(e) => setForm({ ...form, unit_id: e.target.value ? Number(e.target.value) : null })}
                                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-sm transition font-medium"
                            >
                                <option value="">-- Select Mill / Unit --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.unit_code} - {u.unit_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-2.5 rounded-xl text-xs font-bold transition disabled:opacity-50 shadow-sm cursor-pointer"
                        >
                            {saving ? "Saving Product..." : "Save Product Specification"}
                        </button>
                    </div>
                </form>
            )}

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h3 className="font-extrabold text-sm text-slate-900">Finished Product Specifications</h3>
                        <p className="text-xs text-slate-500">Official registered steel SKUs manufactured across all mills</p>
                    </div>

                    <div className="w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search products..."
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
                                <th className="p-3.5">Product Code</th>
                                <th className="p-3.5">Specification & Name</th>
                                <th className="p-3.5">Profile Type</th>
                                <th className="p-3.5 pr-6">Manufacturing Unit</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        {loading ? "Loading product catalog records..." : "No products found."}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="p-3.5 pl-6 text-slate-400 font-mono">
                                            #{product.id}
                                        </td>
                                        <td className="p-3.5">
                                            <span className="font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200/80">
                                                {product.product_code}
                                            </span>
                                        </td>
                                        <td className="p-3.5 font-bold text-slate-800">
                                            {product.product_name}
                                        </td>
                                        <td className="p-3.5 text-slate-600">
                                            {product.product_type ? (
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700 font-medium">
                                                    {product.product_type}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="p-3.5 pr-6 text-slate-600 font-medium">
                                            {product.unit_code ? `${product.unit_code}` : "All Mill Lines"}
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