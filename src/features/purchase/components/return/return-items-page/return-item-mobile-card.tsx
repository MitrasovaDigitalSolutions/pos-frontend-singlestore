"use client";

import { AppButton } from "@/components/shared/app-button";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBarcode, IconCheck, IconTrash } from "@tabler/icons-react";
import type { PurchaseItemLocal } from "../../../types";

interface ReturnItemMobileCardProps {
  item: PurchaseItemLocal;
  index: number;
  disabled?: boolean;
  onUpdateItem: (
    temp_uid: string,
    data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi" | "alasan">>
  ) => void;
  onRemoveItem?: (temp_uid: string) => void;
}

export function ReturnItemMobileCard({
  item,
  index,
  disabled = false,
  onUpdateItem,
  onRemoveItem,
}: ReturnItemMobileCardProps) {
  const subtotal = item.kuantitas * item.harga_estimasi;
  const isSelected = item.kuantitas > 0;

  return (
    <div
      id={`return-item-card-${item.temp_uid}`}
      className={`bg-white border rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all duration-200 ${
        isSelected
          ? "border-emerald-200 ring-1 ring-emerald-400/20 bg-emerald-50/20"
          : "border-slate-100"
      }`}
    >
      {/* ── Header: Number, Name, Barcode & Action ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-semibold text-slate-800 text-xs leading-snug break-words">
                {item.nama}
              </h4>
              {isSelected && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                  <IconCheck size={10} /> Diretur
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-mono">
              <IconBarcode size={12} className="text-slate-400 shrink-0" />
              <span>{item.barcode || "Tanpa barcode"}</span>
            </div>
          </div>
        </div>

        {onRemoveItem && !disabled && (
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
            Qty Diretur
          </label>
          <FormNumberInput
            name={`items.${index}.kuantitas`}
            min={0}
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
            Harga Beli
          </label>
          <FormNominalInput
            name={`items.${index}.harga_estimasi`}
            disabled={disabled}
            className="w-full text-xs font-medium h-9 rounded-xl text-right bg-slate-50/50 border-slate-200 focus:bg-white text-slate-700"
            onValueChange={(val) => {
              if (val !== undefined && val !== null) {
                onUpdateItem(item.temp_uid, { harga_estimasi: Number(val) });
              }
            }}
          />
        </div>
      </div>

      {/* ── Alasan Input ── */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Alasan Retur
        </label>
        <input
          type="text"
          defaultValue={item.alasan || ""}
          placeholder="cth: Barang rusak, kedaluwarsa, dsb."
          disabled={disabled}
          onBlur={(e) => {
            onUpdateItem(item.temp_uid, { alasan: e.target.value });
          }}
          className="w-full text-xs h-8 px-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-400 text-slate-700 placeholder:text-slate-300"
        />
      </div>

      {/* ── Subtotal Badge Footer ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/70 text-xs">
        <span className="text-[11px] font-medium text-slate-400">Total Nilai Retur</span>
        <span className="font-bold text-slate-800 text-xs font-mono">
          {formatRupiah(subtotal)}
        </span>
      </div>
    </div>
  );
}
