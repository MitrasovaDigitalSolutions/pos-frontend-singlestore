import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/products/types";
import { IconBarcode, IconInfoCircle, IconX } from "@tabler/icons-react";
import { forwardRef, useState } from "react";
import { toast } from "sonner";

interface OpnameScannerCardProps {
    disabled?: boolean;
    onProductFound: (product: Product) => void;
}

export const OpnameScannerCard = forwardRef<HTMLInputElement, OpnameScannerCardProps>(
    function OpnameScannerCard(
        {
            disabled,
            onProductFound,
        }: OpnameScannerCardProps,
        ref
    ) {
        const [notFoundQuery, setNotFoundQuery] = useState("");

        return (
            <div id="barcode-scanner-section" className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-1.5">
                        <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
                            <IconBarcode size={15} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-900">Scan Barcode / Cari Nama Produk</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                        Otomatis mengisi Kategori & Brand dari database
                    </span>
                </div>

                <BarcodeInput
                    ref={ref}
                    autoRefocusOnFound={false}
                    onProductFound={(product) => {
                        setNotFoundQuery("");
                        onProductFound(product);
                    }}
                    onError={(msg) => toast.error(msg)}
                    onProductNotFound={(query) => {
                        setNotFoundQuery(query);
                    }}
                    onInputChange={() => {
                        if (notFoundQuery) setNotFoundQuery("");
                    }}
                    disabled={disabled}
                    placeholder="Scan barcode fisik atau ketik nama barang untuk pencarian cepat..."
                />

            {notFoundQuery && (
                <div className="flex items-center justify-between p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-900 text-xs">
                    <div className="flex items-center gap-2">
                        <IconInfoCircle size={15} className="text-rose-500 shrink-0" />
                        <span>
                            Produk dengan barcode / nama <strong>&quot;{notFoundQuery}&quot;</strong> tidak ditemukan di database.
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setNotFoundQuery("")}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-rose-100 rounded cursor-pointer border-none bg-transparent"
                    >
                        <IconX size={14} />
                    </button>
                </div>
            )}
        </div>
    );
});

OpnameScannerCard.displayName = "OpnameScannerCard";

