"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Category } from "@/features/categories/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    IconArrowsExchange,
    IconChevronDown,
    IconFolder,
    IconGripVertical,
    IconX
} from "@tabler/icons-react";
import type { ParentCategory } from "../../api/parent-categories-api";

interface DraggableCategoryChipProps {
    category: Category;
    parentUid?: string | null;
    allParentCategories?: ParentCategory[];
    onUnassign?: (categoryUid: string, currentParentUid: string) => void;
    onAssignToParent?: (categoryUid: string, targetParentUid: string) => void;
    isOverlay?: boolean;
}

export function DraggableCategoryChip({
    category,
    parentUid,
    allParentCategories = [],
    onUnassign,
    onAssignToParent,
    isOverlay = false,
}: DraggableCategoryChipProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `category-${category.uid}`,
        data: {
            category,
            parentUid: parentUid ?? null,
        },
    });

    const style = transform
        ? {
            transform: CSS.Translate.toString(transform),
        }
        : undefined;

    if (isOverlay) {
        return (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-2xl ring-4 ring-emerald-500/30 cursor-grabbing scale-105 transition-transform z-50">
                <IconGripVertical size={16} className="opacity-80" />
                <span>{category.nama}</span>
            </div>
        );
    }

    const availableParents = allParentCategories.filter((p) => p.uid !== parentUid);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border select-none group ${isDragging
                ? "opacity-30 border-dashed border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700"
                : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-emerald-500/50 hover:shadow-md cursor-grab active:cursor-grabbing"
                }`}
        >
            <IconGripVertical size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />

            <span className="truncate max-w-[220px] sm:max-w-[260px] font-semibold text-slate-800 dark:text-slate-200">
                {category.nama}
            </span>

            {/* Quick Move Dropdown */}
            {allParentCategories.length > 0 && onAssignToParent && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5"
                            title="Pindahkan ke Kategori Induk lain"
                        >
                            <IconChevronDown size={12} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Pindahkan ke Kategori Induk:
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableParents.length > 0 ? (
                            availableParents.map((parent) => (
                                <DropdownMenuItem
                                    key={parent.uid}
                                    onClick={() => onAssignToParent(category.uid, parent.uid)}
                                    className="cursor-pointer text-xs font-semibold"
                                >
                                    <IconFolder size={14} className="mr-2 text-emerald-600" />
                                    <span className="truncate">{parent.nama}</span>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="px-2 py-1.5 text-[11px] text-slate-400 italic">Tidak ada kategori induk lain</div>
                        )}

                        {parentUid && onUnassign && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onUnassign(category.uid, parentUid)}
                                    className="cursor-pointer text-xs font-semibold text-rose-600 dark:text-rose-400 focus:text-rose-600"
                                >
                                    <IconArrowsExchange size={14} className="mr-2" />
                                    <span>Lepas Kategori</span>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {parentUid && onUnassign && !onAssignToParent && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onUnassign(category.uid, parentUid);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="ml-0.5 p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Lepas dari kategori induk"
                >
                    <IconX size={12} />
                </button>
            )}
        </div>
    );
}
