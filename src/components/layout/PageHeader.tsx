"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    icon?: React.ElementType;
    iconColor?: string;
    actions?: React.ReactNode;
    onOpenAi?: (initialPrompt?: string) => void;
    aiPromptHint?: string;
}

export default function PageHeader({
    title,
    subtitle,
    badge,
    icon: Icon,
    iconColor = "text-orange-500",
    actions,
    onOpenAi,
    aiPromptHint,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
            <div className="flex items-start sm:items-center gap-3.5">
                {Icon && (
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 shadow-xs">
                        <Icon size={24} className={iconColor} />
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {title}
                        </h1>
                        {badge && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200/70 shadow-2xs">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
                {onOpenAi && (
                    <button
                        type="button"
                        onClick={() => onOpenAi(aiPromptHint)}
                        className="group relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100/80 border border-orange-200/90 transition shadow-2xs cursor-pointer"
                        title="Ask Chandan AI Copilot"
                    >
                        <Sparkles size={15} className="text-orange-600 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Ask AI</span>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    </button>
                )}
                {actions}
            </div>
        </div>
    );
}
