"use client";

import {
    IconFolder,
    IconCategory,
    IconCircleCheck,
    IconHelpCircle,
} from "@tabler/icons-react";

interface CategoryMappingStatsProps {
    totalParentCount: number;
    totalCategoryCount: number;
    assignedCategoryCount: number;
    unassignedCategoryCount: number;
}

export function CategoryMappingStats({
    totalParentCount,
    totalCategoryCount,
    assignedCategoryCount,
    unassignedCategoryCount,
}: CategoryMappingStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
                    <IconFolder size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kategori Induk</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">{totalParentCount}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-xl">
                    <IconCategory size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Kategori</p>
                    <p className="text-xl font-black text-slate-900 dark:text-slate-100">{totalCategoryCount}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
                    <IconCircleCheck size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Ter-assign</p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{assignedCategoryCount}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3.5">
                <div className="p-2.5 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 rounded-xl">
                    <IconHelpCircle size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Belum Ter-assign</p>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-450">{unassignedCategoryCount}</p>
                </div>
            </div>
        </div>
    );
}
