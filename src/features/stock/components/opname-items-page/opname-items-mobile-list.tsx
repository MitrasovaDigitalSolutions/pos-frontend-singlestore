import { AppButton } from "@/components/shared/app-button";
import { Button } from "@/components/ui/button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { cn } from "@/lib/utils";
import type { OpnameItemLocal } from "@/stores/opname-items-store";
import {
    IconBarcode,
    IconCategory,
    IconCheck,
    IconDeviceFloppy,
    IconMinus,
    IconPlus,
    IconTag,
    IconTrash,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface OpnameItemsMobileListProps {
    items: OpnameItemLocal[];
    categoryOptions: CommandOption[];
    brandOptions: CommandOption[];
    updateItem: (temp_uid: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan" | "brand_uid" | "category_uid">>) => void;
    removeItem: (temp_uid: string) => void;
    stats: { match: number; positive: number; negative: number };
    isPendingSave: boolean;
    isPendingFinalize: boolean;
    onSaveDraft: () => void;
    onOpenFinalize: () => void;
}

export function OpnameItemsMobileList({
    items,
    categoryOptions,
    brandOptions,
    updateItem,
    removeItem,
    stats,
    isPendingSave,
    isPendingFinalize,
    onSaveDraft,
    onOpenFinalize,
}: OpnameItemsMobileListProps) {
    return (
        <>
            {/* Mobile Card List */}
            <div className="block md:hidden divide-y divide-slate-100 p-2.5 space-y-2.5">
                {items.map((item) => (
                    <OpnameItemMobileCard
                        key={item.temp_uid}
                        item={item}
                        categoryOptions={categoryOptions}
                        brandOptions={brandOptions}
                        updateItem={updateItem}
                        removeItem={removeItem}
                    />
                ))}
                {items.length === 0 && (
                    <div className="text-center py-8 text-slate-400 font-semibold text-xs flex flex-col items-center justify-center gap-1.5">
                        <IconBarcode size={24} className="text-slate-300" />
                        <span>Belum ada barang dihitung. Scan barcode di atas.</span>
                    </div>
                )}
            </div>

            {/* Mobile Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 sm:hidden flex items-center justify-between gap-2 shadow-lg">
                <div className="text-[11px] leading-tight text-slate-600">
                    <span className="font-bold text-slate-900">{items.length}</span> barang dihitung
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span>Cocok: <strong className="text-emerald-600">{stats.match}</strong></span>
                        <span>•</span>
                        <span>
                            Selisih:{" "}
                            <strong className={stats.positive + stats.negative > 0 ? "text-rose-600" : "text-slate-500"}>
                                {stats.positive + stats.negative}
                            </strong>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        onClick={onSaveDraft}
                        disabled={items.length === 0 || isPendingSave}
                        variant="outline"
                        size="sm"
                        className="h-8 px-2.5 text-xs font-bold border-blue-200 text-blue-700 bg-blue-50/50"
                    >
                        <IconDeviceFloppy size={14} className="mr-1" />
                        Draf
                    </Button>
                    <Button
                        type="button"
                        onClick={onOpenFinalize}
                        disabled={items.length === 0 || isPendingSave || isPendingFinalize}
                        size="sm"
                        className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-xs"
                    >
                        <IconCheck size={14} className="mr-1" />
                        Finalisasi
                    </Button>
                </div>
            </div>
        </>
    );
}

interface OpnameItemMobileCardProps {
    item: OpnameItemLocal;
    categoryOptions: CommandOption[];
    brandOptions: CommandOption[];
    updateItem: (temp_uid: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan" | "brand_uid" | "category_uid">>) => void;
    removeItem: (temp_uid: string) => void;
}

type RowFormInput = {
    stok_fisik: number;
    alasan: string;
};

function OpnameItemMobileCard({
    item,
    categoryOptions,
    brandOptions,
    updateItem,
    removeItem,
}: OpnameItemMobileCardProps) {
    const methods = useForm<RowFormInput>({
        defaultValues: {
            stok_fisik: item.stok_fisik,
            alasan: item.alasan || "Opname rutin",
        },
    });

    const { reset } = methods;

    useEffect(() => {
        reset({
            stok_fisik: item.stok_fisik,
            alasan: item.alasan || "Opname rutin",
        });
    }, [item.stok_fisik, item.alasan, reset]);

    const diff = (Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0);

    return (
        <FormProvider {...methods}>
            <div
                id={`opname-item-${item.product_uid}`}
                className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs space-y-2.5 transition-all"
            >
                {/* Header Row: Nama, Barcode, Delete Button */}
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-xs leading-tight">{item.nama}</p>
                        {item.barcode && (
                            <span className="inline-flex items-center gap-0.5 font-mono text-[9px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded mt-0.5">
                                <IconBarcode size={10} className="opacity-70" />
                                {item.barcode}
                            </span>
                        )}
                    </div>
                    <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(item.temp_uid)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md shrink-0"
                    >
                        <IconTrash size={15} />
                    </AppButton>
                </div>

                {/* Stock Controls & Discrepancy Indicator */}
                <div className="flex items-center justify-between gap-2 bg-slate-50/60 p-2 rounded-lg border border-slate-100/80">
                    <div className="text-[11px] text-slate-500 font-mono">
                        Sistem: <strong className="text-slate-700">{item.stok_sistem}</strong>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1">
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateItem(item.temp_uid, { stok_fisik: Math.max(0, (Number(item.stok_fisik) || 0) - 1) })}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-700 rounded-md font-bold"
                        >
                            <IconMinus size={12} />
                        </AppButton>
                        <div className="w-14">
                            <FormNumberInput<RowFormInput>
                                name="stok_fisik"
                                onValueChange={(val) => {
                                    updateItem(item.temp_uid, { stok_fisik: val || 0 });
                                }}
                                className="h-7 text-center rounded-md border-slate-200 p-0 text-xs font-bold font-mono bg-white"
                            />
                        </div>
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateItem(item.temp_uid, { stok_fisik: (Number(item.stok_fisik) || 0) + 1 })}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-700 rounded-md font-bold"
                        >
                            <IconPlus size={12} />
                        </AppButton>
                    </div>

                    {/* Selisih Badge */}
                    <span className={cn(
                        "font-mono font-bold text-[10px] px-1.5 py-0.5 rounded",
                        diff === 0
                            ? "bg-slate-200/60 text-slate-600"
                            : diff > 0
                                ? "bg-blue-100 text-blue-700"
                                : "bg-rose-100 text-rose-700"
                    )}>
                        {diff > 0 ? `+${diff}` : diff}
                    </span>
                </div>

                {/* Category & Brand Selectors */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="space-y-0.5">
                        <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                            <IconCategory size={10} />
                            <span>Kategori</span>
                        </label>
                        <CommandSelect
                            options={categoryOptions}
                            value={item.category_uid || ""}
                            onChange={(val) => updateItem(item.temp_uid, { category_uid: val || null })}
                            placeholder="Pilih Kategori"
                            searchPlaceholder="Cari kategori..."
                            emptyMessage="Tidak ada"
                            size="sm"
                            className="h-7 text-[10.5px] bg-white border-slate-200"
                        />
                    </div>

                    <div className="space-y-0.5">
                        <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                            <IconTag size={10} />
                            <span>Brand</span>
                        </label>
                        <CommandSelect
                            options={brandOptions}
                            value={item.brand_uid || ""}
                            onChange={(val) => updateItem(item.temp_uid, { brand_uid: val || null })}
                            placeholder="Pilih Brand"
                            searchPlaceholder="Cari brand..."
                            emptyMessage="Tidak ada"
                            size="sm"
                            className="h-7 text-[10.5px] bg-white border-slate-200"
                        />
                    </div>
                </div>

                {/* Alasan Input */}
                <div className="pt-0.5">
                    <FormInput<RowFormInput>
                        name="alasan"
                        placeholder="Alasan selisih (misal: Barang rusak)..."
                        onChange={(e) => {
                            updateItem(item.temp_uid, { alasan: e.target.value });
                        }}
                        className="h-7 border-slate-200 focus-visible:ring-emerald-600 rounded-md text-[11px]"
                    />
                </div>
            </div>
        </FormProvider>
    );
}
