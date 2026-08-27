"use client";

import Link from "next/link";

import {
    Package,
    Factory,
    ArrowRightLeft,
    Search,
    ArrowUpRight,
} from "lucide-react";

interface Card {
    title: string;
    description: string;
    icon: React.ElementType;
    href: string;
}

const cards: Card[] = [

    {
        title: "Products",
        description:
            "Manage steel products",
        icon: Package,
        href: "/dashboard/products",
    },

    {
        title: "Production",
        description:
            "Manage production batches",
        icon: Factory,
        href: "/dashboard/production",
    },

    {
        title: "Transfers",
        description:
            "Track material movement",
        icon: ArrowRightLeft,
        href: "/dashboard/transfers",
    },

    {
        title: "Traceability",
        description:
            "Trace billet to final product",
        icon: Search,
        href: "/dashboard/traceability",
    },
];

export default function DashboardPage() {

    return (
        <div>

            {/* TITLE */}

            <div className="mb-8">

                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                <p className="text-slate-500 mt-1">
                    Welcome to Chandan Steel
                    Traceability System.
                </p>

            </div>

            {/* CARDS */}

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">

                {cards.map((card) => {

                    const Icon =
                        card.icon;

                    return (

                        <Link
                            key={card.title}
                            href={card.href}
                            className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition"
                        >

                            <div className="flex items-start justify-between">

                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">

                                    <Icon
                                        size={23}
                                        className="text-orange-500"
                                    />

                                </div>

                                <ArrowUpRight
                                    size={20}
                                    className="text-slate-400 group-hover:text-orange-500"
                                />

                            </div>

                            <h2 className="text-lg font-bold mt-5">
                                {card.title}
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                {card.description}
                            </p>

                        </Link>

                    );
                })}

            </div>

            {/* TRACEABILITY FLOW */}

            <div className="bg-white border rounded-2xl p-6 mt-8">

                <h2 className="text-xl font-bold">
                    Traceability Flow
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                    Track material from heat to
                    final product.
                </p>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-6 gap-3">

                    {[
                        "Grade",
                        "Heat",
                        "Billet",
                        "Transfer",
                        "Production",
                        "Product",
                    ].map((item, index) => (

                        <div
                            key={item}
                            className="relative"
                        >

                            <div className="bg-slate-100 rounded-xl p-4 text-center">

                                <p className="text-xs text-slate-400">
                                    STEP {index + 1}
                                </p>

                                <p className="font-semibold mt-1">
                                    {item}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}