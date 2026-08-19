import { AppButton } from "@/components/shared/app-button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { OpnameItemLocal } from "@/stores/opname-items-store";
import {
    IconBarcode,
    IconCategory,
    IconMinus,
    IconPlus,
    IconTag,
    IconTrash,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface OpnameItemsTableProps {
    items: OpnameItemLocal[];
    categoryOptions: CommandOption[];
    brandOptions: CommandOption[];
    updateItem: (temp_uid: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan" | "brand_uid" | "category_uid">>) => void;
    removeItem: (temp_uid: string) => void;
}

export function OpnameItemsTable({
    items,
    categoryOptions,
    brandOptions,
    updateItem,
    removeItem,
}: OpnameItemsTableProps) {
    return (
        <div className="hidden md:block overflow-x-auto">
            <Table className="w-full text-left border-collapse">
                <TableHeader className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <TableRow className="hover:bg-transparent border-b border-slate-100">
                        <TableHead className="p-2.5 font-bold text-slate-500 uppercase tracking-wider min-w-[180px]">
                            Nama Produk
                        </TableHead>
                        <TableHead className="p-2.5 font-bold text-slate-500 uppercase tracking-wider w-40">
                            Kategori
                        </TableHead>
                        <TableHead className="p-2.5 font-bold text-slate-500 uppercase tracking-wider w-36">
                            Brand
                        </TableHead>
                        <TableHead className="p-2.5 text-right font-bold text-slate-500 uppercase tracking-wider w-24">
                            Stok Sistem
                        </TableHead>
                        <TableHead className="p-2.5 text-center font-bold text-slate-500 uppercase tracking-wider w-32">
                            Stok Fisik
                        </TableHead>
                        <TableHead className="p-2.5 text-right font-bold text-slate-500 uppercase tracking-wider w-24">
                            Selisih
                        </TableHead>
                        <TableHead className="p-2.5 font-bold text-slate-500 uppercase tracking-wider min-w-[160px]">
                            Alasan Selisih
                        </TableHead>
                        <TableHead className="p-2.5 text-center w-12 font-bold text-slate-500 uppercase tracking-wider">
                            Aksi
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <OpnameItemDesktopRow
                            key={item.temp_uid}
                            item={item}
                            categoryOptions={categoryOptions}
                            brandOptions={brandOptions}
                            updateItem={updateItem}
                            removeItem={removeItem}
                        />
                    ))}
                    {items.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-10 text-slate-400 font-semibold text-xs">
                                <div className="flex flex-col items-center justify-center gap-1.5">
                                    <IconBarcode size={24} className="text-slate-300" />
                                    <span>Belum ada barang dihitung. Gunakan scanner barcode atau autocomplete di atas.</span>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

interface OpnameItemDesktopRowProps {
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

function OpnameItemDesktopRow({
    item,
    categoryOptions,
    brandOptions,
    updateItem,
    removeItem,
}: OpnameItemDesktopRowProps) {
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
            <TableRow
                id={`opname-item-${item.product_uid}`}
                className="hover:bg-slate-50/40 transition-colors text-xs font-medium text-slate-700"
            >
                {/* Nama Produk & Barcode */}
                <TableCell className="p-2.5 align-middle">
                    <p className="font-bold text-slate-900 text-xs leading-tight">{item.nama}</p>
                    {item.barcode && (
                        <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] text-slate-400 bg-slate-50 px-1 py-0.2 rounded mt-0.5">
                            <IconBarcode size={11} className="opacity-70" />
                            {item.barcode}
                        </span>
                    )}
                </TableCell>

                {/* Kategori Selector */}
                <TableCell className="p-2 align-middle">
                    <CommandSelect
                        options={categoryOptions}
                        value={item.category_uid || ""}
                        onChange={(val) => updateItem(item.temp_uid, { category_uid: val || null })}
                        placeholder="Pilih Kategori"
                        searchPlaceholder="Cari kategori..."
                        emptyMessage="Kategori tidak ditemukan"
                        size="sm"
                        leftIcon={<IconCategory size={12} className="text-slate-400" />}
                        className="h-7.5 text-[11px] bg-white border-slate-200"
                    />
                </TableCell>

                {/* Brand Selector */}
                <TableCell className="p-2 align-middle">
                    <CommandSelect
                        options={brandOptions}
                        value={item.brand_uid || ""}
                        onChange={(val) => updateItem(item.temp_uid, { brand_uid: val || null })}
                        placeholder="Pilih Brand"
                        searchPlaceholder="Cari brand..."
                        emptyMessage="Brand tidak ditemukan"
                        size="sm"
                        leftIcon={<IconTag size={12} className="text-slate-400" />}
                        className="h-7.5 text-[11px] bg-white border-slate-200"
                    />
                </TableCell>

                {/* Stok Sistem */}
                <TableCell className="p-2.5 text-right font-mono text-slate-500 align-middle">
                    {item.stok_sistem} pcs
                </TableCell>

                {/* Stok Fisik (Stepper) */}
                <TableCell className="p-2 text-center align-middle">
                    <div className="flex items-center justify-center gap-0.5">
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateItem(item.temp_uid, { stok_fisik: Math.max(0, (Number(item.stok_fisik) || 0) - 1) })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs"
                        >
                            <IconMinus size={11} />
                        </AppButton>
                        <div className="w-16">
                            <FormNumberInput<RowFormInput>
                                name="stok_fisik"
                                onValueChange={(val) => {
                                    updateItem(item.temp_uid, { stok_fisik: val || 0 });
                                }}
                                className="h-7 text-center rounded-md border-slate-200 p-0 text-xs font-bold font-mono"
                            />
                        </div>
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateItem(item.temp_uid, { stok_fisik: (Number(item.stok_fisik) || 0) + 1 })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-xs"
                        >
                            <IconPlus size={11} />
                        </AppButton>
                    </div>
                </TableCell>

                {/* Selisih */}
                <TableCell className="p-2.5 text-right align-middle">
                    <span className={cn(
                        "inline-block font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md",
                        diff === 0
                            ? "bg-slate-100 text-slate-500"
                            : diff > 0
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                    )}>
                        {diff > 0 ? `+${diff}` : diff} pcs
                    </span>
                </TableCell>

                {/* Alasan Selisih */}
                <TableCell className="p-2 align-middle">
                    <FormInput<RowFormInput>
                        name="alasan"
                        placeholder="Alasan selisih..."
                        onChange={(e) => {
                            updateItem(item.temp_uid, { alasan: e.target.value });
                        }}
                        className="h-7.5 border-slate-200 focus-visible:ring-emerald-600 rounded-md text-[11px]"
                    />
                </TableCell>

                {/* Aksi Hapus */}
                <TableCell className="p-2 text-center align-middle">
                    <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeItem(item.temp_uid)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Hapus dari daftar"
                    >
                        <IconTrash size={15} />
                    </AppButton>
                </TableCell>
            </TableRow>
        </FormProvider>
    );
}
