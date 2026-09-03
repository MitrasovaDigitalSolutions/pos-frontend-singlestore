"use client";

import React from "react";
import {
    IconMinus,
    IconPlus,
    IconWallet,
    IconBuildingBank,
    IconReceipt,
    IconCreditCard,
    IconPencil,
    IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashAccount } from "../api/cash-api";

interface CashAccountCardProps {
    account: CashAccount;
    isSelected: boolean;
    onClick: () => void;
    onAction: (account: CashAccount, type: "debit" | "credit") => void;
    onEdit: (account: CashAccount) => void;
    onDelete: (account: CashAccount) => void;
    canManage: boolean;
    className?: string;
}

export const getAccountTypeConfig = (tipe: string, nama: string) => {
    const tipeLower = (tipe || "").toLowerCase();
    const namaLower = (nama || "").toLowerCase();

    if (tipeLower === "bank" || namaLower.includes("bank") || namaLower.includes("rekening")) {
        return {
            type: "bank" as const,
            label: "Bank",
            icon: IconBuildingBank,
            selectedClass: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-xs",
            badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80",
            iconContainerClass: "bg-blue-50 text-blue-600 border border-blue-100",
            accentBarClass: "bg-blue-500",
        };
    }
    
    if (tipeLower === "register" || namaLower.includes("kasir") || namaLower.includes("laci")) {
        return {
            type: "register" as const,
            label: "Kasir",
            icon: IconReceipt,
            selectedClass: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 shadow-xs",
            badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
            iconContainerClass: "bg-amber-50 text-amber-600 border border-amber-100",
            accentBarClass: "bg-amber-500",
        };
    }

    if (tipeLower === "edc" || namaLower.includes("edc") || namaLower.includes("qris") || namaLower.includes("digital") || namaLower.includes("linkaja") || namaLower.includes("gopay") || namaLower.includes("ovo") || namaLower.includes("shopee")) {
        return {
            type: "edc" as const,
            label: "EDC/QRIS",
            icon: IconCreditCard,
            selectedClass: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/20 shadow-xs",
            badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80",
            iconContainerClass: "bg-purple-50 text-purple-600 border border-purple-100",
            accentBarClass: "bg-purple-500",
        };
    }

    // Default/Fallback is Cash (Kas/Brankas)
    return {
        type: "cash" as const,
        label: "Kas",
        icon: IconWallet,
        selectedClass: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-xs",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        iconContainerClass: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        accentBarClass: "bg-emerald-500",
    };
};

export function CashAccountCard({
    account,
    isSelected,
    onClick,
    onAction,
    onEdit,
    onDelete,
    canManage,
    className,
}: CashAccountCardProps) {
    const config = getAccountTypeConfig(account.tipe, account.nama);
    const CardIcon = config.icon;
    const isInactive = account.is_active === false;

    return (
        <div
            onClick={onClick}
            className={cn(
                "rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between p-3 gap-2.5 select-none min-h-[105px]",
                isSelected
                    ? isInactive
                        ? "border-slate-400 ring-2 ring-slate-400/25 bg-slate-100/80 shadow-xs z-10"
                        : `${config.selectedClass} z-10`
                    : isInactive
                    ? "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs",
                className
            )}
        >
            {/* Decorative accent bar */}
            <div
                className={cn(
                    "w-1 h-full absolute left-0 top-0 transition-colors",
                    isInactive
                        ? isSelected
                            ? "bg-slate-500"
                            : "bg-slate-300"
                        : config.accentBarClass
                )}
            />

            {/* Upper Section: Account details & Actions */}
            <div className="flex items-start justify-between gap-2 pl-1.5">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                        className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner",
                            isInactive
                                ? "bg-slate-100 text-slate-400 border border-slate-200/60"
                                : config.iconContainerClass
                        )}
                    >
                        <CardIcon size={16} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                        <h4
                            className={cn(
                                "font-extrabold text-xs truncate",
                                isInactive ? "text-slate-600" : "text-slate-800"
                            )}
                            title={account.nama}
                        >
                            {account.nama}
                        </h4>
                        <p
                            className="text-[9.5px] text-slate-400 font-medium truncate mt-0.5"
                            title={account.nomor_rekening || account.deskripsi || undefined}
                        >
                            {account.nomor_rekening ? (
                                <span className="font-mono text-slate-500 bg-slate-100/90 px-1 py-0.2 rounded border border-slate-200/50 inline-block">
                                    {account.nomor_rekening}
                                </span>
                            ) : (
                                account.deskripsi || (config.type === "register" ? "Laci Kasir Aktif" : "Kas Toko")
                            )}
                        </p>
                    </div>
                </div>

                {/* Right side: Badge + Edit/Delete Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <span
                        className={cn(
                            "inline-flex items-center justify-center text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none border",
                            isInactive
                                ? "bg-slate-100 text-slate-500 border-slate-200/80"
                                : config.badgeClass
                        )}
                    >
                        {config.label}
                    </span>

                    {canManage && (
                        <div className="flex items-center ml-0.5">
                            <button
                                type="button"
                                title="Ubah Akun Kas"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(account);
                                }}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            >
                                <IconPencil size={12} strokeWidth={2.2} />
                            </button>
                            <button
                                type="button"
                                title="Hapus Akun Kas"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(account);
                                }}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                                <IconTrash size={12} strokeWidth={2.2} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Lower Section: Saldo & Quick Mutation Buttons / Nonaktif Badge */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 pl-1.5 min-h-[34px]">
                <div className="leading-tight min-w-0 flex-1 mr-2">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">
                        Saldo
                    </span>
                    <span
                        className="text-xs sm:text-sm font-black text-slate-800 tracking-tight block truncate"
                        title={formatRupiah(account.saldo)}
                    >
                        {formatRupiah(account.saldo)}
                    </span>
                </div>

                {!isInactive && canManage ? (
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction(account, "debit");
                            }}
                            className="h-6.5 text-[9px] font-extrabold text-emerald-700 border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-100/70 hover:border-emerald-300 cursor-pointer flex items-center justify-center gap-1 rounded-md transition-all duration-150 active:scale-95 px-2"
                        >
                            <IconPlus size={10} strokeWidth={3} />
                            In
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAction(account, "credit");
                            }}
                            className="h-6.5 text-[9px] font-extrabold text-rose-700 border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/70 hover:border-rose-300 cursor-pointer flex items-center justify-center gap-1 rounded-md transition-all duration-150 active:scale-95 px-2"
                        >
                            <IconMinus size={10} strokeWidth={3} />
                            Out
                        </Button>
                    </div>
                ) : isInactive ? (
                    <div className="inline-flex items-center justify-center h-5.5 px-2.5 rounded-md border border-slate-200 bg-slate-100 text-slate-500 shrink-0 select-none">
                        <span className="text-[9px] font-bold uppercase tracking-normal leading-none pt-[0.5px]">
                            Nonaktif
                        </span>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
