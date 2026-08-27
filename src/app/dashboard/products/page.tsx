"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    Plus,
    RefreshCw,
    Package,
    X,
} from "lucide-react";

import { api } from "../../../lib/api";

import type {
    Product,
    CreateProductRequest,
} from "../../../types/product";

export default function ProductsPage() {

    const [products, setProducts] =
        useState<Product[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [showForm, setShowForm] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        form,
        setForm,
    ] = useState<CreateProductRequest>({
        product_code: "",
        product_name: "",
        product_type: "",
        unit_id: null,
    });

    const loadProducts = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.getProducts();

            setProducts(
                response.data
            );

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

    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        try {

            setSaving(true);

            await api.createProduct(
                form
            );

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
        <div>

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">

                            <Package
                                className="text-orange-500"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold">
                                Products
                            </h1>

                            <p className="text-slate-500">
                                Manage steel products
                            </p>

                        </div>

                    </div>

                </div>

                <div className="flex gap-3">

                    <button
                        onClick={
                            loadProducts
                        }
                        className="bg-white border px-4 py-2.5 rounded-lg flex items-center gap-2"
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>

                    <button
                        onClick={() =>
                            setShowForm(
                                !showForm
                            )
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2"
                    >

                        {showForm
                            ? <X size={18} />
                            : <Plus size={18} />
                        }

                        {showForm
                            ? "Close"
                            : "Add Product"
                        }

                    </button>

                </div>

            </div>

            {/* ERROR */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>

            )}

            {/* FORM */}

            {showForm && (

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="bg-white border rounded-2xl p-6 mb-6"
                >

                    <h2 className="text-lg font-bold mb-5">
                        Create New Product
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <input
                            value={
                                form.product_code
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    product_code:
                                        e.target.value,
                                })
                            }
                            placeholder="Product Code"
                            className="border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                            required
                        />

                        <input
                            value={
                                form.product_name
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    product_name:
                                        e.target.value,
                                })
                            }
                            placeholder="Product Name"
                            className="border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                            required
                        />

                        <input
                            value={
                                form.product_type ??
                                ""
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    product_type:
                                        e.target.value,
                                })
                            }
                            placeholder="Product Type"
                            className="border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                        />

                        <input
                            type="number"
                            value={
                                form.unit_id ??
                                ""
                            }
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    unit_id:
                                        e.target.value
                                            ? Number(
                                                  e.target
                                                      .value
                                              )
                                            : null,
                                })
                            }
                            placeholder="Unit ID"
                            className="border rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="mt-5 bg-slate-950 text-white px-6 py-3 rounded-lg disabled:opacity-50"
                    >

                        {saving
                            ? "Creating..."
                            : "Create Product"
                        }

                    </button>

                </form>

            )}

            {/* TABLE */}

            <div className="bg-white border rounded-2xl overflow-hidden">

                <div className="p-5 border-b">

                    <h2 className="font-bold">
                        Product List
                    </h2>

                    <p className="text-sm text-slate-500">
                        Total products:{" "}
                        {products.length}
                    </p>

                </div>

                {loading ? (

                    <div className="p-12 text-center text-slate-500">
                        Loading products...
                    </div>

                ) : products.length === 0 ? (

                    <div className="p-12 text-center">

                        <Package
                            size={40}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-slate-500">
                            No products found
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="text-left px-6 py-4 text-sm">
                                        ID
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm">
                                        Code
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm">
                                        Product
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm">
                                        Type
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm">
                                        Unit
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {products.map(
                                    (product) => (

                                        <tr
                                            key={
                                                product.id
                                            }
                                            className="border-t hover:bg-slate-50"
                                        >

                                            <td className="px-6 py-4">
                                                {
                                                    product.id
                                                }
                                            </td>

                                            <td className="px-6 py-4 font-semibold">
                                                {
                                                    product.product_code
                                                }
                                            </td>

                                            <td className="px-6 py-4">
                                                {
                                                    product.product_name
                                                }
                                            </td>

                                            <td className="px-6 py-4">
                                                {
                                                    product.product_type ||
                                                    "-"
                                                }
                                            </td>

                                            <td className="px-6 py-4">
                                                {
                                                    product.unit_code ||
                                                    "-"
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}