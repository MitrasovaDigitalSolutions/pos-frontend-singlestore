import {
    IconCheck,
    IconClipboard,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";

interface OpnameStatsCardsProps {
    totalCount: number;
    matchCount: number;
    positiveCount: number;
    negativeCount: number;
}

export function OpnameStatsCards({
    totalCount,
    matchCount,
    positiveCount,
    negativeCount,
}: OpnameStatsCardsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Scanned
                    </span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {totalCount} <span className="text-[10px] font-normal text-slate-500">Barang</span>
                    </p>
                </div>
                <div className="bg-slate-50 text-slate-600 p-1.5 rounded-lg">
                    <IconClipboard size={16} />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Sesuai Sistem
                    </span>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                        {matchCount} <span className="text-[10px] font-normal text-emerald-600/70">Barang</span>
                    </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg">
                    <IconCheck size={16} />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Selisih Lebih (+)
                    </span>
                    <p className="text-sm font-bold text-blue-600 mt-0.5">
                        {positiveCount} <span className="text-[10px] font-normal text-blue-600/70">Barang</span>
                    </p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                    <IconPlus size={16} />
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-xs flex items-center justify-between">
                <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        Selisih Kurang (-)
                    </span>
                    <p className="text-sm font-bold text-rose-600 mt-0.5">
                        {negativeCount} <span className="text-[10px] font-normal text-rose-600/70">Barang</span>
                    </p>
                </div>
                <div className="bg-rose-50 text-rose-600 p-1.5 rounded-lg">
                    <IconTrash size={16} />
                </div>
            </div>
        </div>
    );
}
