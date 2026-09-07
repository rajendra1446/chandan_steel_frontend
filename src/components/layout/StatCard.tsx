"use client";

import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    iconBg?: string;
    iconColor?: string;
    badge?: string;
    trend?: {
        value: string;
        positive?: boolean;
        label?: string;
    };
    onClick?: () => void;
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBg = "bg-orange-50",
    iconColor = "text-orange-600",
    badge,
    trend,
    onClick,
}: StatCardProps) {
    return (
        <div
            onClick={onClick}
            className={`bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all duration-200 ${
                onClick ? "cursor-pointer hover:shadow-md hover:border-orange-300 active:scale-[0.99]" : "hover:shadow-xs"
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {title}
                    </span>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            {value}
                        </p>
                        {badge && (
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                                {badge}
                            </span>
                        )}
                    </div>
                </div>

                {icon && (
                    <div
                        className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border border-black/5 shadow-2xs`}
                    >
                        {icon}
                    </div>
                )}
            </div>

            {(subtitle || trend) && (
                <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    {subtitle && (
                        <span className="text-slate-500 font-medium truncate">
                            {subtitle}
                        </span>
                    )}
                    {trend && (
                        <span
                            className={`font-semibold shrink-0 ${
                                trend.positive ? "text-emerald-700" : "text-rose-700"
                            }`}
                        >
                            {trend.value} {trend.label && <span className="font-normal text-slate-400">{trend.label}</span>}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
