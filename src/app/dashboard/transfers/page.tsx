"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import {
    ArrowRight,
    ArrowRightLeft,
    CheckCircle2,
    Clock,
    Plus,
    RefreshCw,
    X,
} from "lucide-react";

import { api, Unit,
    Transfer, } from "../../../lib/api";



interface CreateTransfer {
    billet_id: number | null;
    from_unit_id: number | null;
    to_unit_id: number | null;
    quantity: number | null;
    transfer_type: string;
    remarks: string;
}



export default function TransfersPage() {

    const [transfers, setTransfers] =
        useState<Transfer[]>([]);

    const [units, setUnits] =
        useState<Unit[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [showForm, setShowForm] =
        useState(false);

    const [error, setError] =
        useState("");

    const [form, setForm] =
        useState<CreateTransfer>({
            billet_id: null,
            from_unit_id: null,
            to_unit_id: null,
            quantity: null,
            transfer_type: "TRANSFER",
            remarks: "",
        });


    // =========================
    // GET TRANSFERS
    // =========================

    const loadTransfers = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.getTransfers();

            setTransfers(response.data);

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load transfers"
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================
    // GET UNITS
    // =========================

    const loadUnits = async () => {

        try {

            const response =
                await api.getUnits();

            setUnits(response.data);

        } catch (error) {

            console.error(error);
        }
    };


    useEffect(() => {

        loadTransfers();
        loadUnits();

    }, []);


    // =========================
    // CREATE TRANSFER
    // =========================

   const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
) => {

    e.preventDefault();

    const billetId = form.billet_id;
    const fromUnitId = form.from_unit_id;
    const toUnitId = form.to_unit_id;
    const quantity = form.quantity;

    if (billetId === null) {
        alert("Billet ID is required");
        return;
    }

    if (fromUnitId === null) {
        alert("From Unit is required");
        return;
    }

    if (toUnitId === null) {
        alert("To Unit is required");
        return;
    }

    if (quantity === null) {
        alert("Quantity is required");
        return;
    }

    try {

        setSaving(true);

        await api.createTransfer({
            billet_id: billetId,
            from_unit_id: fromUnitId,
            to_unit_id: toUnitId,
            quantity: quantity,
            transfer_type: form.transfer_type,
            remarks: form.remarks,
        });

        alert("Transfer created successfully");

        setForm({
            billet_id: null,
            from_unit_id: null,
            to_unit_id: null,
            quantity: null,
            transfer_type: "TRANSFER",
            remarks: "",
        });

        setShowForm(false);

        await loadTransfers();

    } catch (error) {

        alert(
            error instanceof Error
                ? error.message
                : "Transfer creation failed"
        );

    } finally {

        setSaving(false);
    }
};

    return (

        <div>

            {/* ================= HEADER ================= */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">

                            <ArrowRightLeft
                                size={24}
                                className="text-orange-500"
                            />

                        </div>

                        <div>

                            <h1 className="text-3xl font-bold">
                                Material Transfers
                            </h1>

                            <p className="text-slate-500 mt-1">
                                Track billet movement between units
                            </p>

                        </div>

                    </div>

                </div>


                <div className="flex gap-3">

                    <button
                        onClick={
                            loadTransfers
                        }
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-lg hover:bg-slate-50"
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
                        className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                    >

                        {showForm ? (
                            <X size={18} />
                        ) : (
                            <Plus size={18} />
                        )}

                        {showForm
                            ? "Close"
                            : "New Transfer"}

                    </button>

                </div>

            </div>


            {/* ================= ERROR ================= */}

            {error && (

                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">

                    {error}

                </div>

            )}


            {/* ================= CREATE FORM ================= */}

            {showForm && (

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="bg-white border rounded-2xl p-6 mb-6"
                >

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-xl font-bold">
                                Create Transfer
                            </h2>

                            <p className="text-sm text-slate-500">
                                Transfer material from one unit to another
                            </p>

                        </div>

                    </div>


                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

                        {/* BILLET */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Billet ID
                            </label>

                            <input
                                type="number"
                                value={
                                    form.billet_id ??
                                    ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        billet_id:
                                            e.target.value
                                                ? Number(
                                                      e.target.value
                                                  )
                                                : null,
                                    })
                                }
                                placeholder="Example: 1"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                required
                            />

                        </div>


                        {/* FROM UNIT */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                From Unit
                            </label>

                            <select
                                value={
                                    form.from_unit_id ??
                                    ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        from_unit_id:
                                            e.target.value
                                                ? Number(
                                                      e.target.value
                                                  )
                                                : null,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500"
                                required
                            >

                                <option value="">
                                    Select Unit
                                </option>

                                {units.map(
                                    (unit) => (

                                        <option
                                            key={
                                                unit.id
                                            }
                                            value={
                                                unit.id
                                            }
                                        >
                                            {
                                                unit.unit_code
                                            }{" "}
                                            -{" "}
                                            {
                                                unit.unit_name
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* TO UNIT */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                To Unit
                            </label>

                            <select
                                value={
                                    form.to_unit_id ??
                                    ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        to_unit_id:
                                            e.target.value
                                                ? Number(
                                                      e.target.value
                                                  )
                                                : null,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500"
                                required
                            >

                                <option value="">
                                    Select Unit
                                </option>

                                {units.map(
                                    (unit) => (

                                        <option
                                            key={
                                                unit.id
                                            }
                                            value={
                                                unit.id
                                            }
                                        >
                                            {
                                                unit.unit_code
                                            }{" "}
                                            -{" "}
                                            {
                                                unit.unit_name
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>


                        {/* QUANTITY */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Quantity (KG)
                            </label>

                            <input
                                type="number"
                                step="0.001"
                                min="0"
                                value={
                                    form.quantity ??
                                    ""
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        quantity:
                                            e.target.value
                                                ? Number(
                                                      e.target.value
                                                  )
                                                : null,
                                    })
                                }
                                placeholder="Example: 3000"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500"
                                required
                            />

                        </div>


                        {/* TRANSFER TYPE */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Transfer Type
                            </label>

                            <select
                                value={
                                    form.transfer_type
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        transfer_type:
                                            e.target.value,
                                    })
                                }
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white outline-none focus:border-orange-500"
                            >

                                <option value="TRANSFER">
                                    TRANSFER
                                </option>

                                <option value="RETURN">
                                    RETURN
                                </option>

                                <option value="ADJUSTMENT">
                                    ADJUSTMENT
                                </option>

                            </select>

                        </div>


                        {/* REMARKS */}

                        <div className="md:col-span-2 lg:col-span-3">

                            <label className="block text-sm font-medium mb-2">
                                Remarks
                            </label>

                            <textarea
                                rows={3}
                                value={
                                    form.remarks
                                }
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        remarks:
                                            e.target.value,
                                    })
                                }
                                placeholder="Example: SMS to WRM"
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 outline-none focus:border-orange-500 resize-none"
                            />

                        </div>

                    </div>


                    <div className="flex justify-end mt-6">

                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-slate-950 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                        >

                            {saving
                                ? "Creating..."
                                : "Create Transfer"}

                        </button>

                    </div>

                </form>

            )}


            {/* ================= SUMMARY ================= */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

                <SummaryCard
                    title="Total Transfers"
                    value={
                        transfers.length
                    }
                    icon={
                        <ArrowRightLeft
                            size={22}
                        />
                    }
                />

                <SummaryCard
                    title="Completed"
                    value={
                        transfers.filter(
                            (item) =>
                                item.transfer_type ===
                                "TRANSFER"
                        ).length
                    }
                    icon={
                        <CheckCircle2
                            size={22}
                        />
                    }
                />

                <SummaryCard
                    title="Latest Transfer"
                    value={
                        transfers.length > 0
                            ? formatDate(
                                  transfers[0]
                                      .transfer_date
                              )
                            : "-"
                    }
                    icon={
                        <Clock
                            size={22}
                        />
                    }
                />

            </div>


            {/* ================= TABLE ================= */}

            <div className="bg-white border rounded-2xl overflow-hidden">

                <div className="p-6 border-b">

                    <h2 className="text-xl font-bold">
                        Transfer History
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Complete material movement history
                    </p>

                </div>


                {loading ? (

                    <div className="p-12 text-center text-slate-500">
                        Loading transfers...
                    </div>

                ) : transfers.length === 0 ? (

                    <div className="p-12 text-center">

                        <ArrowRightLeft
                            size={42}
                            className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 font-medium">
                            No transfers found
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            Create your first material transfer.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-slate-50">

                                <tr>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        ID
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Billet
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Movement
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Quantity
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Type
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Date
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Remarks
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {transfers.map(
                                    (transfer) => (

                                        <tr
                                            key={
                                                transfer.id
                                            }
                                            className="border-t hover:bg-slate-50"
                                        >

                                            {/* ID */}

                                            <td className="px-6 py-4 font-medium">
                                                {
                                                    transfer.id
                                                }
                                            </td>


                                            {/* BILLET */}

                                            <td className="px-6 py-4">

                                                <p className="font-semibold">
                                                    {
                                                        transfer.billet_no ||
                                                        `Billet #${transfer.billet_id ?? "-"}`
                                                    }
                                                </p>

                                            </td>


                                            {/* MOVEMENT */}

                                            <td className="px-6 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div>

                                                        <p className="font-semibold">
                                                            {
                                                                transfer.from_unit
                                                            }
                                                        </p>

                                                        {transfer.from_unit_name && (

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    transfer.from_unit_name
                                                                }
                                                            </p>

                                                        )}

                                                    </div>


                                                    <ArrowRight
                                                        size={18}
                                                        className="text-orange-500 flex-shrink-0"
                                                    />


                                                    <div>

                                                        <p className="font-semibold">
                                                            {
                                                                transfer.to_unit
                                                            }
                                                        </p>

                                                        {transfer.to_unit_name && (

                                                            <p className="text-xs text-slate-500">
                                                                {
                                                                    transfer.to_unit_name
                                                                }
                                                            </p>

                                                        )}

                                                    </div>

                                                </div>

                                            </td>


                                            {/* QUANTITY */}

                                            <td className="px-6 py-4">

                                                <span className="font-semibold">
                                                    {
                                                        transfer.quantity
                                                    }
                                                </span>

                                                <span className="text-sm text-slate-500 ml-1">
                                                    KG
                                                </span>

                                            </td>


                                            {/* TYPE */}

                                            <td className="px-6 py-4">

                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">

                                                    {
                                                        transfer.transfer_type
                                                    }

                                                </span>

                                            </td>


                                            {/* DATE */}

                                            <td className="px-6 py-4 text-sm">

                                                {
                                                    formatDate(
                                                        transfer.transfer_date
                                                    )
                                                }

                                            </td>


                                            {/* REMARKS */}

                                            <td className="px-6 py-4 text-sm text-slate-500">

                                                {
                                                    transfer.remarks ||
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


// =========================
// SUMMARY CARD
// =========================

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


// =========================
// DATE FORMAT
// =========================

function formatDate(
    date: string
): string {

    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}