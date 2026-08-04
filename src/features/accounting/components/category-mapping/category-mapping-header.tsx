"use client";

import { Button } from "@/components/ui/button";
import { IconFolder, IconPlus, IconRefresh } from "@tabler/icons-react";

interface CategoryMappingHeaderProps {
    totalCategoryCount: number;
    assignedCategoryCount: number;
    unassignedCategoryCount: number;
    completionPercent: number;
    onRefresh: () => void;
    onAddParent: () => void;
}

export function CategoryMappingHeader({
    totalCategoryCount,
    assignedCategoryCount,
    unassignedCategoryCount,
    completionPercent,
    onRefresh,
    onAddParent,
}: CategoryMappingHeaderProps) {
    return (
        <div className="space-y-4">
            {/* Top Bar: Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <IconFolder size={22} className="text-emerald-500" />
                        <span>Mapping Kategori Produk</span>
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Kelompokkan kategori produk ke dalam Kategori Induk untuk keperluan laporan keuangan dan akuntansi.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="h-9 px-3 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                        title="Refresh Data"
                    >
                        <IconRefresh size={15} className="mr-1.5" />
                        <span>Refresh</span>
                    </Button>

                    <Button
                        onClick={onAddParent}
                        className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                        <IconPlus size={16} className="mr-1.5" />
                        <span>Tambah Kategori Induk</span>
                    </Button>
                </div>
            </div>

            {/* Progress Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">Status Pemetaan</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {assignedCategoryCount} / {totalCategoryCount} terpetakan
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {completionPercent}% Selesai
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            {unassignedCategoryCount} Belum Ter-assign
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
