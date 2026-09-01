"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import {
    IconArrowsExchange,
    IconEdit,
    IconTrash,
    IconCheck,
    IconX,
    IconLoader2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableActionButton } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { ACCOUNT_TYPE_CONFIG } from "../../constants/counterpart-constants";
import { CoaPickerTrigger } from "../shared/coa-picker-trigger";
import { useCounterpartRowEdit } from "./hooks/use-counterpart-row-edit";
import type { ChartOfAccount, ChartOfAccountType, CoaCounterpartMapping } from "../../types";

interface CounterpartMappingTableProps {
    mappings: CoaCounterpartMapping[];
    accounts: ChartOfAccount[];
    existingMappings: CoaCounterpartMapping[];
    onDelete: (mapping: CoaCounterpartMapping) => void;
    canManage?: boolean;
}

export function CounterpartMappingTable({
    mappings,
    accounts,
    existingMappings,
    onDelete,
    canManage = true,
}: CounterpartMappingTableProps) {
    const [editingUid, setEditingUid] = useState<string | null>(null);

    const columns = useMemo<ColumnDef<CoaCounterpartMapping>[]>(() => {
        return [
            {
                id: "index",
                header: "#",
                size: 50,
                cell: ({ row }) => (
                    <span className="text-xs font-semibold text-slate-400">
                        {row.index + 1}
                    </span>
                ),
            },
            {
                accessorKey: "coa",
                header: "Akun Utama (CoA)",
                minSize: 220,
                cell: ({ row }) => {
                    const m = row.original;
                    const isEditing = editingUid === m.uid;

                    if (isEditing) {
                        return <InlineEditCoa mapping={m} accounts={accounts} existingMappings={existingMappings} onFinish={() => setEditingUid(null)} />;
                    }

                    const mainCoa = m.coa;
                    const typeConfig = mainCoa?.tipe ? ACCOUNT_TYPE_CONFIG[mainCoa.tipe as ChartOfAccountType] : null;

                    return (
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/80 dark:border-blue-900 shrink-0">
                                {mainCoa?.kode || "N/A"}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {mainCoa?.nama || "Akun tidak ditemukan"}
                            </span>
                            {typeConfig && (
                                <Badge
                                    variant="outline"
                                    className={cn("text-[9px] px-1 py-0 font-medium shrink-0 ml-auto hidden sm:inline-flex", typeConfig.bg, typeConfig.text, typeConfig.border)}
                                >
                                    {typeConfig.label}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "direction",
                header: "",
                size: 40,
                cell: () => (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px]">
                        ⇄
                    </span>
                ),
            },
            {
                accessorKey: "counterpart",
                header: "Akun Lawan (Penyeimbang)",
                minSize: 220,
                cell: ({ row }) => {
                    const m = row.original;
                    if (editingUid === m.uid) {
                        return null; // rendered in merged inline edit
                    }

                    const counterpartCoa = m.counterpart;
                    const typeConfig = counterpartCoa?.tipe ? ACCOUNT_TYPE_CONFIG[counterpartCoa.tipe as ChartOfAccountType] : null;

                    return (
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-200/80 dark:border-violet-900 shrink-0">
                                {counterpartCoa?.kode || "N/A"}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {counterpartCoa?.nama || "Akun tidak ditemukan"}
                            </span>
                            {typeConfig && (
                                <Badge
                                    variant="outline"
                                    className={cn("text-[9px] px-1 py-0 font-medium shrink-0 ml-auto hidden sm:inline-flex", typeConfig.bg, typeConfig.text, typeConfig.border)}
                                >
                                    {typeConfig.label}
                                </Badge>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "keterangan",
                header: "Keterangan",
                minSize: 160,
                cell: ({ row }) => {
                    const m = row.original;
                    if (editingUid === m.uid) return null;

                    return m.keterangan ? (
                        <span className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-1">
                            {m.keterangan}
                        </span>
                    ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600">-</span>
                    );
                },
            },
            {
                id: "actions",
                header: () => <span className="sr-only">Aksi</span>,
                size: 80,
                cell: ({ row }) => {
                    const m = row.original;
                    if (!canManage || editingUid === m.uid) return null;

                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            <DataTableActionButton
                                variant="sky"
                                tooltip="Edit Mapping"
                                onClick={() => setEditingUid(m.uid)}
                            >
                                <IconEdit size={14} />
                            </DataTableActionButton>

                            <DataTableActionButton
                                variant="rose"
                                tooltip="Hapus Mapping"
                                onClick={() => onDelete(m)}
                            >
                                <IconTrash size={14} />
                            </DataTableActionButton>
                        </div>
                    );
                },
            },
        ];
    }, [editingUid, accounts, existingMappings, canManage, onDelete]);

    return (
        <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
            <DataTable
                columns={columns}
                data={mappings}
                emptyMessage="Tidak ada data mapping lawan akun."
                className="border-none shadow-none"
            />
        </div>
    );
}

// Inline edit row helper component
function InlineEditCoa({
    mapping,
    accounts,
    existingMappings,
    onFinish,
}: {
    mapping: CoaCounterpartMapping;
    accounts: ChartOfAccount[];
    existingMappings: CoaCounterpartMapping[];
    onFinish: () => void;
}) {
    const {
        editCoaUid,
        setEditCoaUid,
        editCounterpartUid,
        setEditCounterpartUid,
        editKeterangan,
        setEditKeterangan,
        isDuplicate,
        handleSave,
        isPending,
    } = useCounterpartRowEdit({ mapping, accounts, existingMappings });

    const onSaveAndClose = async () => {
        await handleSave();
        onFinish();
    };

    return (
        <div className="flex flex-wrap items-center gap-2 py-1 col-span-5 w-full">
            <div className="w-52">
                <CoaPickerTrigger
                    value={editCoaUid}
                    onChange={(val) => {
                        setEditCoaUid(val);
                        if (val === editCounterpartUid) setEditCounterpartUid("");
                    }}
                    accounts={accounts}
                    placeholder="Akun Utama..."
                    size="sm"
                />
            </div>

            <IconArrowsExchange size={14} className="text-blue-500" />

            <div className="w-52">
                <CoaPickerTrigger
                    value={editCounterpartUid}
                    onChange={setEditCounterpartUid}
                    accounts={accounts}
                    excludeUid={editCoaUid}
                    disabled={!editCoaUid}
                    placeholder="Akun Lawan..."
                    size="sm"
                />
            </div>

            <div className="w-40">
                <Input
                    value={editKeterangan}
                    onChange={(e) => setEditKeterangan(e.target.value)}
                    placeholder="Keterangan..."
                    className="h-8 text-xs bg-white dark:bg-slate-900"
                />
            </div>

            {isDuplicate && (
                <span className="text-[10px] text-rose-500 font-semibold">Duplikat!</span>
            )}

            <div className="flex items-center gap-1 ml-auto">
                <Button
                    type="button"
                    size="icon-xs"
                    onClick={onSaveAndClose}
                    disabled={!editCoaUid || !editCounterpartUid || isDuplicate || isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white w-7 h-7 rounded-md"
                    title="Simpan"
                >
                    {isPending ? <IconLoader2 size={13} className="animate-spin" /> : <IconCheck size={13} stroke={2.5} />}
                </Button>
                <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={onFinish}
                    disabled={isPending}
                    className="w-7 h-7 rounded-md text-slate-500 hover:bg-slate-100"
                    title="Batal"
                >
                    <IconX size={13} />
                </Button>
            </div>
        </div>
    );
}
