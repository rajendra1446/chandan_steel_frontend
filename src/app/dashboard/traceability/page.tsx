"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    Search,
    Factory,
    ArrowRight,
    CircleCheck,
    Package,
    Flame,
    Truck,
} from "lucide-react";

import { api } from "../../../lib/api";

import type {
    TraceabilityData,
} from "../../../types/traceability";

export default function TraceabilityPage() {

    const [billetNo, setBilletNo] =
        useState("");

    const [data, setData] =
        useState<TraceabilityData | null>(
            null
        );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSearch = async (
        e: FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();

        if (!billetNo.trim()) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const response =
                await api.getBilletTraceability(
                    billetNo.trim()
                );

            setData(response.data);

        } catch (error) {

            setData(null);

            setError(
                error instanceof Error
                    ? error.message
                    : "Traceability data not found"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div>

            {/* HEADER */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    Steel Traceability
                </h1>

                <p className="text-slate-500 mt-1">
                    Trace billet from heat to final
                    production.
                </p>

            </div>

            {/* SEARCH */}

            <form
                onSubmit={handleSearch}
                className="bg-white border rounded-2xl p-5 mb-6"
            >

                <label className="font-semibold">
                    Billet Number
                </label>

                <div className="flex gap-3 mt-3">

                    <div className="relative flex-1">

                        <Search
                            size={19}
                            className="absolute left-3 top-3.5 text-slate-400"
                        />

                        <input
                            value={billetNo}
                            onChange={(e) =>
                                setBilletNo(
                                    e.target.value
                                )
                            }
                            placeholder="Example: B260825001"
                            className="w-full border rounded-lg py-3 pl-10 pr-4 outline-none focus:border-orange-500"
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-orange-500 text-white px-6 rounded-lg font-semibold"
                    >

                        {loading
                            ? "Searching..."
                            : "Trace"
                        }

                    </button>

                </div>

            </form>

            {/* ERROR */}

            {error && (

                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
                    {error}
                </div>

            )}

            {data && (

                <div className="space-y-6">

                    {/* BILLET */}

                    <div className="bg-white border rounded-2xl p-6">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">

                                <Package
                                    className="text-orange-500"
                                />

                            </div>

                            <div>

                                <p className="text-sm text-slate-500">
                                    Billet
                                </p>

                                <h2 className="text-2xl font-bold">
                                    {
                                        data.billet.billet_no
                                    }
                                </h2>

                            </div>

                            <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">

                                {
                                    data.billet.status
                                }

                            </span>

                        </div>

                        <div className="grid md:grid-cols-3 gap-4">

                            <Info
                                label="Quantity"
                                value={`${data.billet.quantity} ${data.billet.unit}`}
                            />

                            <Info
                                label="Production Date"
                                value={formatDate(
                                    data.billet
                                        .production_date
                                )}
                            />

                            <Info
                                label="Status"
                                value={
                                    data.billet.status
                                }
                            />

                        </div>

                    </div>

                    {/* SOURCE */}

                    <div className="bg-white border rounded-2xl p-6">

                        <h2 className="text-xl font-bold mb-6">
                            Source Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-5">

                            {/* HEAT */}

                            <div className="border rounded-xl p-5">

                                <div className="flex gap-3">

                                    <Flame className="text-orange-500" />

                                    <div>

                                        <p className="text-sm text-slate-500">
                                            Heat
                                        </p>

                                        <p className="font-bold text-lg">
                                            {
                                                data.source
                                                    .heat
                                                    .heat_no
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* GRADE */}

                            <div className="border rounded-xl p-5">

                                <div className="flex gap-3">

                                    <Factory className="text-orange-500" />

                                    <div>

                                        <p className="text-sm text-slate-500">
                                            Grade
                                        </p>

                                        <p className="font-bold text-lg">
                                            {
                                                data.source
                                                    .grade
                                                    .code
                                            }
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {
                                                data.source
                                                    .grade
                                                    .name
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* TRANSFERS */}

                    <div className="bg-white border rounded-2xl p-6">

                        <h2 className="text-xl font-bold mb-6">
                            Material Transfers
                        </h2>

                        <div className="space-y-5">

                            {data.transfers.map(
                                (transfer) => (

                                    <div
                                        key={
                                            transfer.id
                                        }
                                        className="relative pl-8"
                                    >

                                        <div className="absolute left-0 top-1 w-4 h-4 bg-orange-500 rounded-full" />

                                        <div className="border rounded-xl p-5">

                                            <div className="flex flex-wrap items-center gap-3">

                                                <span className="font-bold">
                                                    {
                                                        transfer.from_unit
                                                    }
                                                </span>

                                                <ArrowRight
                                                    size={18}
                                                    className="text-orange-500"
                                                />

                                                <span className="font-bold">
                                                    {
                                                        transfer.to_unit
                                                    }
                                                </span>

                                                <span className="ml-auto text-sm text-slate-500">
                                                    {
                                                        transfer.quantity
                                                    } KG
                                                </span>

                                            </div>

                                            <p className="text-sm text-slate-500 mt-2">
                                                {
                                                    transfer
                                                        .from_unit_name
                                                }

                                                {" → "}

                                                {
                                                    transfer
                                                        .to_unit_name
                                                }
                                            </p>

                                            {transfer.remarks && (

                                                <p className="text-sm mt-2">
                                                    {
                                                        transfer.remarks
                                                    }
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                    {/* PRODUCTION */}

                    <div className="bg-white border rounded-2xl p-6">

                        <h2 className="text-xl font-bold mb-6">
                            Production
                        </h2>

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-slate-50">

                                    <tr>

                                        <th className="text-left px-4 py-3">
                                            Batch
                                        </th>

                                        <th className="text-left px-4 py-3">
                                            Unit
                                        </th>

                                        <th className="text-left px-4 py-3">
                                            Consumed
                                        </th>

                                        <th className="text-left px-4 py-3">
                                            Product
                                        </th>

                                        <th className="text-left px-4 py-3">
                                            Quantity
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {data.production.map(
                                        (production) => (

                                            <tr
                                                key={
                                                    production.batch_id
                                                }
                                                className="border-t"
                                            >

                                                <td className="px-4 py-4 font-semibold">
                                                    {
                                                        production.batch_no
                                                    }
                                                </td>

                                                <td className="px-4 py-4">
                                                    {
                                                        production.unit_code
                                                    }
                                                </td>

                                                <td className="px-4 py-4">
                                                    {
                                                        production.billet_consumed
                                                    }{" "}
                                                    KG
                                                </td>

                                                <td className="px-4 py-4">

                                                    {production
                                                        .product_name
                                                        ? (
                                                            <div>

                                                                <p className="font-semibold">
                                                                    {
                                                                        production
                                                                            .product_name
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        production
                                                                            .product_code
                                                                    }
                                                                </p>

                                                            </div>
                                                        )
                                                        : (
                                                            <span className="text-slate-400">
                                                                Not assigned
                                                            </span>
                                                        )}

                                                </td>

                                                <td className="px-4 py-4">

                                                    {
                                                        production
                                                            .product_quantity
                                                        || "-"
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                    {/* FINAL FLOW */}

                    <div className="bg-slate-950 text-white rounded-2xl p-6">

                        <h2 className="text-xl font-bold mb-6">
                            Complete Traceability
                        </h2>

                        <div className="flex flex-wrap items-center gap-3">

                            <FlowItem text="Heat" />

                            <ArrowRight />

                            <FlowItem text="Grade" />

                            <ArrowRight />

                            <FlowItem text="Billet" />

                            <ArrowRight />

                            <FlowItem text="Transfer" />

                            <ArrowRight />

                            <FlowItem text="Production" />

                            <ArrowRight />

                            <FlowItem text="Product" />

                        </div>

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

        <div className="bg-slate-50 rounded-xl p-4">

            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="font-semibold mt-1">
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

        <div className="flex items-center gap-2">

            <CircleCheck
                size={18}
                className="text-orange-500"
            />

            <span className="font-medium">
                {text}
            </span>

        </div>
    );
}

function formatDate(
    date: string
): string {

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}