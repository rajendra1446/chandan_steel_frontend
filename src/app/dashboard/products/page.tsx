"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, RefreshCw, Package, X } from "lucide-react";
import { api } from "../../../lib/api";
import type { Product, CreateProductRequest } from "../../../types/product";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<CreateProductRequest>({
        product_code: "",
        product_name: "",
        product_type: "",
        unit_id: null,
    });

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.getProducts();
            setProducts(response.data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load products"
            );
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
            alert(
                error instanceof Error
                    ? error.message
                    : "Product creation failed"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-6mx-auto">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center">
                        <Package className="text-orange-500" size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Products
                        </h1>
                        <p className="text-sm text-slate-500">
                            Manage finished steel products & specifications
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadProducts}
                        className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition shadow-xs"
                    >
                        {showForm ? <X size={18} /> : <Plus size={18} />}
                        {showForm ? "Close" : "Add Product"}
                    </button>
                </div>
            </div>

            {/* ERROR NOTIFICATION */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* CREATE PRODUCT FORM */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
                >
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Create New Product
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Product Code *
                            </label>
                            <input
                                value={form.product_code}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        product_code: e.target.value,
                                    })
                                }
                                placeholder="e.g. TMT-500D-12MM"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Product Name *
                            </label>
                            <input
                                value={form.product_name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        product_name: e.target.value,
                                    })
                                }
                                placeholder="e.g. TMT Rebar 12mm Fe 500D"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Product Type
                            </label>
                            <input
                                value={form.product_type ?? ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        product_type: e.target.value,
                                    })
                                }
                                placeholder="e.g. Rebar / Round / Square"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                                Unit ID
                            </label>
                            <input
                                type="number"
                                value={form.unit_id ?? ""}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        unit_id: e.target.value
                                            ? Number(e.target.value)
                                            : null,
                                    })
                                }
                                placeholder="e.g. 1"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm transition"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 shadow-xs"
                        >
                            {saving ? "Creating Product..." : "Create Product"}
                        </button>
                    </div>
                </form>
            )}

            {/* TABLE SECTION */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-slate-900">Product List</h2>
                        <p className="text-xs text-slate-500">
                            Total registered products: {products.length}
                        </p>
                    </div>
                    <span className="bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1 rounded-md text-xs font-semibold">
                        {products.length} Items
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-500 text-sm">
                        Loading products...
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package
                            size={40}
                            className="mx-auto text-slate-300"
                        />
                        <p className="mt-3 text-slate-500 text-sm">
                            No products found. Click &quot;Add Product&quot; to create one.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">
                                        Code
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">
                                        Product
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">
                                        Type
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">
                                        Unit
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-orange-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            #{product.id}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-orange-600">
                                            {product.product_code}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {product.product_name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {product.product_type ? (
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-700">
                                                    {product.product_type}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {product.unit_code || "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}