import { Skeleton } from "@/components/ui/skeleton";

export function OpnameItemsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header Area Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-52" />
                        <Skeleton className="h-3 w-72" />
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-8 w-28 rounded-lg" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-8 w-28 rounded-lg" />
                    <Skeleton className="h-8 w-36 rounded-lg" />
                </div>
            </div>

            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs flex items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-2.5 w-16" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-7 w-7 rounded-lg" />
                    </div>
                ))}
            </div>

            {/* Scanner Skeleton */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs space-y-2">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-9 w-full rounded-lg" />
            </div>

            {/* Table Skeleton */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-3">
                <Skeleton className="h-3.5 w-32" />
                <div className="border border-slate-100 rounded-xl p-3 space-y-3 bg-slate-50/20">
                    <div className="flex justify-between border-b pb-2 border-slate-100">
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="flex justify-between pt-1">
                            <Skeleton className="h-3.5 w-36" />
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-3.5 w-12" />
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-3.5 w-6" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
