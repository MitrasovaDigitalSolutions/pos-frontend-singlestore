import { IconInfoCircle, IconX } from "@tabler/icons-react";

interface OpnameInstructionsProps {
    open: boolean;
    onClose: () => void;
}

const STEPS = [
    {
        num: "1",
        title: "Scan / Cari Produk",
        desc: "Pindai barcode atau ketik nama produk pada input scanner untuk memasukkan barang ke daftar.",
    },
    {
        num: "2",
        title: "Hitung Stok Fisik",
        desc: "Ketik jumlah fisik aktual di rak. Tekan Enter untuk langsung kembali ke input scan barcode berikutnya.",
    },
    {
        num: "3",
        title: "Kategori & Brand",
        desc: "Ubah Kategori atau Brand langsung di baris barang jika menemukan ketidaksesuaian klasifikasi produk fisik.",
    },
    {
        num: "4",
        title: "Alasan Selisih",
        desc: 'Beri catatan alasan bila ada selisih (misal: "Barang rusak", "Expired", "Temuan rak", dll).',
    },
    {
        num: "5",
        title: "Simpan & Finalisasi",
        desc: "Simpan Draf berkala agar progres aman. Klik Finalisasi setelah seluruh perhitungan fisik selesai.",
    },
];

export function OpnameInstructions({ open, onClose }: OpnameInstructionsProps) {
    if (!open) return null;

    return (
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50/60 border border-emerald-100 rounded-xl p-3.5 shadow-xs transition-all duration-200 relative">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100/60 mb-2.5">
                <div className="flex items-center gap-1.5 text-emerald-800">
                    <IconInfoCircle size={16} className="text-emerald-600" />
                    <h3 className="text-xs font-bold">Panduan Pelaksanaan Stock Opname</h3>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md cursor-pointer"
                    title="Tutup Petunjuk"
                >
                    <IconX size={14} />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-[11px] text-slate-600 leading-relaxed">
                {STEPS.map((step) => (
                    <div
                        key={step.num}
                        className="bg-white/80 p-2.5 rounded-lg border border-emerald-50/80 space-y-1"
                    >
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                                {step.num}
                            </span>
                            <span>{step.title}</span>
                        </div>
                        <p className="text-slate-500 text-[10.5px]">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
