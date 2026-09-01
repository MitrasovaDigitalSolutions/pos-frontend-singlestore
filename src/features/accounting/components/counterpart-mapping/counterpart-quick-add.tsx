"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    IconArrowsExchange,
    IconChevronDown,
    IconChevronUp,
    IconLoader2,
    IconPlus,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoaPickerTrigger } from "../shared/coa-picker-trigger";
import { useCreateCoaCounterpartMapping } from "../../api/counterpart-mapping-api";
import type { ChartOfAccount, CoaCounterpartMapping } from "../../types";

interface CounterpartQuickAddProps {
    accounts: ChartOfAccount[];
    existingMappings: CoaCounterpartMapping[];
    onSuccess?: () => void;
}

export function CounterpartQuickAdd({
    accounts,
    existingMappings,
    onSuccess,
}: CounterpartQuickAddProps) {
    const [coaUid, setCoaUid] = useState<string>("");
    const [counterpartCoaUid, setCounterpartCoaUid] = useState<string>("");
    const [keterangan, setKeterangan] = useState<string>("");
    const [isExpandedMobile, setIsExpandedMobile] = useState<boolean>(true);

    const createMutation = useCreateCoaCounterpartMapping();

    const isDuplicate = useMemo(() => {
        if (!coaUid || !counterpartCoaUid) return false;
        return existingMappings.some(
            (m) => m.coa_uid === coaUid && m.counterpart_coa_uid === counterpartCoaUid
        );
    }, [coaUid, counterpartCoaUid, existingMappings]);

    const canSubmit = coaUid && counterpartCoaUid && !isDuplicate && !createMutation.isPending;

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;

        try {
            await createMutation.mutateAsync({
                coa_uid: coaUid,
                counterpart_coa_uid: counterpartCoaUid,
                keterangan: keterangan.trim() || null,
            });
            toast.success("Mapping lawan akun berhasil ditambahkan.");
            setCoaUid("");
            setCounterpartCoaUid("");
            setKeterangan("");
            onSuccess?.();
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal menambahkan mapping lawan akun.");
        }
    };

    return (
        <form
            onSubmit={handleAdd}
            className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-800 space-y-3 transition-all"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <IconPlus size={15} className="text-blue-600" />
                    <span>Tambah Mapping Lawan Akun</span>
                </div>

                <div className="flex items-center gap-2">
                    {isDuplicate && (
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                            Pasangan ini sudah ada!
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsExpandedMobile(!isExpandedMobile)}
                        className="md:hidden text-slate-500 hover:text-slate-700 p-1 rounded-md cursor-pointer"
                        title="Toggle Form"
                    >
                        {isExpandedMobile ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {isExpandedMobile && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                    {/* Akun Utama */}
                    <div className="md:col-span-4 min-w-0">
                        <label className="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Akun Utama (CoA) *
                        </label>
                        <CoaPickerTrigger
                            value={coaUid}
                            onChange={(val) => {
                                setCoaUid(val);
                                if (val === counterpartCoaUid) {
                                    setCounterpartCoaUid("");
                                }
                            }}
                            accounts={accounts}
                            placeholder="Pilih Akun Utama..."
                            dialogTitle="Pilih Akun Utama (CoA)"
                            size="md"
                        />
                    </div>

                    {/* Arrow Connector Indicator - Desktop */}
                    <div className="hidden md:flex md:col-span-1 items-center justify-center text-slate-400">
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
                            <IconArrowsExchange size={14} />
                        </div>
                    </div>

                    {/* Arrow Connector Indicator - Mobile */}
                    <div className="flex md:hidden items-center justify-center gap-1.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <IconArrowsExchange size={14} />
                        <span className="text-[11px]">Diseimbangkan dengan</span>
                    </div>

                    {/* Akun Lawan */}
                    <div className="md:col-span-4 min-w-0">
                        <label className="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Akun Lawan (Penyeimbang) *
                        </label>
                        <CoaPickerTrigger
                            value={counterpartCoaUid}
                            onChange={setCounterpartCoaUid}
                            accounts={accounts}
                            excludeUid={coaUid}
                            disabled={!coaUid}
                            placeholder="Pilih Akun Lawan..."
                            dialogTitle="Pilih Akun Lawan (Penyeimbang)"
                            size="md"
                        />
                    </div>

                    {/* Keterangan */}
                    <div className="md:col-span-2 min-w-0">
                        <label className="block md:hidden text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Keterangan / Catatan
                        </label>
                        <Input
                            value={keterangan}
                            onChange={(e) => setKeterangan(e.target.value)}
                            placeholder="Catatan (opsional)..."
                            className="h-10 sm:h-9 text-xs rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-1 flex justify-end pt-1 md:pt-0">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!canSubmit}
                            className="w-full h-10 sm:h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {createMutation.isPending ? (
                                <IconLoader2 size={14} className="animate-spin" />
                            ) : (
                                <IconPlus size={14} />
                            )}
                            <span>Tambah</span>
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
}
