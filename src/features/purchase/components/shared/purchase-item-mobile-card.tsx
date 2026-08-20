"use client";

import { AppButton } from "@/components/shared/app-button";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBarcode, IconTrash } from "@tabler/icons-react";
import type { PurchaseItemLocal } from "../../types";

interface PurchaseItemMobileCardProps {
  item: PurchaseItemLocal;
  index: number;
  priceLabel?: string;
  disabled?: boolean;
  isPriceReadOnly?: boolean;
  isFlashing?: boolean;
  onUpdateItem: (
    temp_uid: string,
    data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi">>
  ) => void;
  onRemoveItem: (temp_uid: string) => void;
}

export function PurchaseItemMobileCard({
  item,
  index,
  priceLabel = "Harga Estimasi",
  disabled = false,
  isPriceReadOnly = false,
  isFlashing = false,
  onUpdateItem,
  onRemoveItem,
}: PurchaseItemMobileCardProps) {
  const subtotal = item.kuantitas * item.harga_estimasi;

  return (
    <div
      id={`purchase-item-card-${item.temp_uid}`}
      className={`bg-white border rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all duration-300 ${
        isFlashing
          ? "border-emerald-300 ring-2 ring-emerald-400/30 bg-emerald-50/40"
          : "border-slate-100 hover:border-slate-200"
      }`}
    >
      {/* ── Header: Number, Name, Barcode & Delete ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-800 text-xs leading-snug break-words">
              {item.nama}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-mono">
              <IconBarcode size={12} className="text-slate-400 shrink-0" />
              <span>{item.barcode || "Tanpa barcode"}</span>
            </div>
          </div>
        </div>

        {!disabled && (
          <AppButton
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.temp_uid)}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl h-8 w-8 shrink-0 transition-colors"
            title="Hapus baris"
          >
            <IconTrash size={16} />
          </AppButton>
        )}
      </div>

      {/* ── Interactive Inputs: Qty & Price ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Kuantitas
          </label>
          <FormNumberInput
            name={`items.${index}.kuantitas`}
            min={1}
            disabled={disabled}
            className="w-full text-xs font-semibold h-9 rounded-xl text-center bg-slate-50/50 border-slate-200 focus:bg-white"
            onValueChange={(val) => {
              if (val !== undefined && val !== null) {
                onUpdateItem(item.temp_uid, { kuantitas: Number(val) });
              }
            }}
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {priceLabel}
          </label>
          <FormNominalInput
            name={`items.${index}.harga_estimasi`}
            disabled={disabled || isPriceReadOnly}
            className={`w-full text-xs font-medium h-9 rounded-xl text-right border-slate-200 ${
              isPriceReadOnly
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-50/50 focus:bg-white text-slate-700"
            }`}
            onValueChange={(val) => {
              if (val !== undefined && val !== null) {
                onUpdateItem(item.temp_uid, { harga_estimasi: Number(val) });
              }
            }}
          />
        </div>
      </div>

      {/* ── Subtotal Badge Footer ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/70 text-xs">
        <span className="text-[11px] font-medium text-slate-400">Subtotal</span>
        <span className="font-bold text-slate-800 text-xs font-mono">
          {formatRupiah(subtotal)}
        </span>
      </div>
    </div>
  );
}
