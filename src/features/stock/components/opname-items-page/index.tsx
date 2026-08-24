"use client";

import { AppButton } from "@/components/shared/app-button";
import { Button } from "@/components/ui/button";
import type { CommandOption } from "@/components/ui/command-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { OPNAME_STATUS } from "@/constants/stock";
import { useBrands } from "@/features/brands/api/brands-api";
import { useCategories } from "@/features/categories/api/categories-api";
import type { Product } from "@/features/products/types";
import { useAppRouter } from "@/hooks/use-app-router";
import { queryKeys } from "@/lib/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { IconArrowUp, IconBarcode } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    useFinalizeOpname,
    useOpnameDetail,
    useOpnameItems,
    useUpdateOpname,
    useUpdateOpnameItems,
} from "../../api/stock-api";
import type { Opname, OpnameItem } from "../../types";
import { EditHeaderDialog } from "./edit-header-dialog";
import { ImportOpnameDraftDialog } from "./import-opname-draft-dialog";
import { OpnameInstructions } from "./opname-instructions";
import { OpnameItemsHeader } from "./opname-items-header";
import { OpnameItemsMobileBar } from "./opname-items-mobile-bar";
import { OpnameItemsSkeleton } from "./opname-items-skeleton";
import { OpnameItemsTable } from "./opname-items-table";
import { OpnameScannerCard } from "./opname-scanner-card";
import { OpnameStatsCards } from "./opname-stats-cards";

interface OpnameItemsPageProps {
    opnameId: string;
}

export function OpnameItemsPage({ opnameId }: OpnameItemsPageProps) {
    const { data: opname, isLoading: opnameLoading, error } = useOpnameDetail(opnameId);
    const router = useAppRouter();

    if (opnameLoading) {
        return <OpnameItemsSkeleton />;
    }

    if (error || !opname) {
        return (
            <div className="p-6 text-center bg-white border border-slate-100 rounded-2xl shadow-xs max-w-md mx-auto mt-8">
                <p className="text-xs font-bold text-slate-800">Error</p>
                <p className="text-[11px] text-slate-400 mt-1">
                    Stock opname tidak ditemukan atau terjadi kesalahan saat memuat data.
                </p>
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                    className="mt-3 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl h-8 px-4"
                >
                    Kembali ke Daftar Stock
                </Button>
            </div>
        );
    }

    if (opname.status !== OPNAME_STATUS.DRAFT) {
        return (
            <div className="p-6 text-center bg-white border border-slate-100 rounded-2xl shadow-xs max-w-md mx-auto mt-8">
                <p className="text-xs font-bold text-slate-800">Akses Ditolak</p>
                <p className="text-[11px] text-slate-400 mt-1">
                    Hanya Stock Opname berstatus <strong>Draft</strong> yang dapat diubah daftar barangnya.
                </p>
                <Button
                    onClick={() => router.push(ROUTES.ADMIN_STOCK)}
                    className="mt-3 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-xl h-8 px-4"
                >
                    Kembali ke Daftar Stock
                </Button>
            </div>
        );
    }

    return <OpnameItemsContainer opnameId={opnameId} opname={opname} />;
}

function OpnameItemsContainer({ opnameId, opname }: { opnameId: string; opname: Opname }) {
    const router = useAppRouter();
    const queryClient = useQueryClient();

    // Server Pagination State
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string | undefined>();
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | undefined>();

    // Fetch Opname Items with Server-Side Pagination
    const {
        data: itemsData,
        isLoading: itemsLoading,
        isFetching: itemsFetching,
    } = useOpnameItems(opnameId, {
        page,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
    });

    const updateOpname = useUpdateOpname();
    const updateOpnameItems = useUpdateOpnameItems();
    const finalizeOpname = useFinalizeOpname();

    // Optimistic / Pending edits for the current view
    const [pendingEdits, setPendingEdits] = useState<Record<string, Partial<OpnameItem>>>({});

    // Categories & Brands queries for dropdown options
    const { data: categoriesData } = useCategories({ per_page: 1000 });
    const { data: brandsData } = useBrands({ per_page: 1000 });

    const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);
    const brands = useMemo(() => brandsData?.data || [], [brandsData?.data]);

    const categoryOptions: CommandOption[] = useMemo(() => [
        { value: "", label: "Tanpa Kategori" },
        ...categories.map((c) => ({
            value: String(c.uid),
            label: c.nama,
        })),
    ], [categories]);

    const brandOptions: CommandOption[] = useMemo(() => [
        { value: "", label: "Tanpa Brand" },
        ...brands.map((b) => ({
            value: String(b.uid),
            label: b.nama,
        })),
    ], [brands]);

    const barcodeInputRef = useRef<HTMLInputElement | null>(null);
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [isImportDraftOpen, setIsImportDraftOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 240) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToInput = () => {
        const element = document.getElementById("barcode-scanner-section");
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => {
                const inputEl = element.querySelector("input");
                if (inputEl) {
                    inputEl.focus();
                }
            }, 250);
        }
    };

    const handleFocusBarcode = useCallback(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
            barcodeInputRef.current.select();
        } else {
            scrollToInput();
        }
    }, []);

    // Merge server items with pending local modifications
    const displayedItems = useMemo(() => {
        return (itemsData?.data || []).map((item) => {
            const edit = pendingEdits[item.uid] || pendingEdits[item.product_uid];
            if (!edit) return item;
            const stok_fisik = edit.stok_fisik !== undefined ? edit.stok_fisik : item.stok_fisik;
            const selisih = (Number(stok_fisik) || 0) - (Number(item.stok_sistem) || 0);
            return {
                ...item,
                ...edit,
                stok_fisik,
                selisih,
            };
        });
    }, [itemsData?.data, pendingEdits]);

    const updateItem = (
        itemId: string,
        data: Partial<Pick<OpnameItem, "stok_fisik" | "alasan" | "brand_uid" | "category_uid">>
    ) => {
        setPendingEdits((prev) => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || {}),
                ...data,
            },
        }));
    };

    const removeItem = async (itemId: string) => {
        const item = displayedItems.find((i) => i.uid === itemId || i.product_uid === itemId);
        if (!item) return;

        try {
            await updateOpnameItems.mutateAsync({
                uid: opnameId,
                data: {
                    items: [
                        {
                            product_uid: item.product_uid,
                            brand_uid: item.brand_uid || null,
                            category_uid: item.category_uid || null,
                            stok_fisik: 0,
                            alasan: "Dihapus dari opname",
                        },
                    ],
                },
            });
            setPendingEdits((prev) => {
                const copy = { ...prev };
                delete copy[itemId];
                delete copy[item.product_uid];
                return copy;
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(opnameId),
            });
            toast.success(`Item ${item.product?.nama || "produk"} berhasil dihapus.`);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal menghapus item.");
        }
    };

    const handleProductFound = async (product: Product) => {
        const existing = displayedItems.find((i) => i.product_uid === product.uid);
        const existingQty = existing ? Number(existing.stok_fisik) || 0 : 0;
        const newQty = existingQty + 1;

        try {
            await updateOpnameItems.mutateAsync({
                uid: opnameId,
                data: {
                    items: [
                        {
                            product_uid: product.uid,
                            brand_uid: product.brand_uid || product.brand?.uid || null,
                            category_uid: product.category_uid || product.category?.uid || null,
                            stok_fisik: newQty,
                            alasan: existing?.alasan || "Opname rutin",
                        },
                    ],
                },
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(opnameId),
            });
            toast.success(`Jumlah ${product.nama} (+1): ${newQty} pcs`);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || `Gagal menambahkan ${product.nama}`);
        }
    };

    const handleSaveDraft = async (showToast = true) => {
        const editKeys = Object.keys(pendingEdits);
        if (editKeys.length === 0) {
            if (showToast) toast.info("Semua perubahan sudah tersimpan.");
            return true;
        }

        const payload = {
            items: editKeys.map((key) => {
                const original = displayedItems.find((i) => i.uid === key || i.product_uid === key);
                const edit = pendingEdits[key];
                return {
                    product_uid: original?.product_uid || key,
                    brand_uid: edit.brand_uid !== undefined ? edit.brand_uid : (original?.brand_uid || null),
                    category_uid: edit.category_uid !== undefined ? edit.category_uid : (original?.category_uid || null),
                    stok_fisik: edit.stok_fisik !== undefined ? Number(edit.stok_fisik) || 0 : (original?.stok_fisik || 0),
                    alasan: edit.alasan !== undefined ? edit.alasan : (original?.alasan || "Opname rutin"),
                };
            }),
        };

        try {
            await updateOpnameItems.mutateAsync({
                uid: opnameId,
                data: payload,
            });
            setPendingEdits({});
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(opnameId),
            });
            if (showToast) toast.success("Draf stock opname berhasil disimpan.");
            return true;
        } catch (err: unknown) {
            const error = err as { message?: string };
            if (showToast) toast.error(error.message || "Gagal menyimpan draf.");
            return false;
        }
    };

    const handleFinalize = async () => {
        const totalCount = itemsData?.meta?.total ?? opname?.items_count ?? displayedItems.length;
        if (totalCount === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum finalisasi.");
            return;
        }

        const saveSuccess = await handleSaveDraft(false);
        if (!saveSuccess) {
            toast.error("Gagal menyimpan draf sebelum finalisasi.");
            return;
        }

        try {
            await finalizeOpname.mutateAsync(opnameId);
            toast.success("Proses finalisasi stock opname selesai!");
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnameDetail(opnameId),
            });
            router.push(ROUTES.ADMIN_STOCK);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal memfinalisasi stock opname.");
        } finally {
            setIsConfirmFinalizeOpen(false);
        }
    };

    const handleReset = () => {
        setIsConfirmResetOpen(true);
    };

    const handleConfirmReset = () => {
        setPendingEdits({});
        setIsConfirmResetOpen(false);
        toast.info("Perubahan lokal yang belum disimpan telah dibatalkan.");
    };

    const handleImportDraftSuccess = () => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.inventory.opnameDetail(opnameId),
        });
        setPage(1);
    };

    const totalItemsCount = itemsData?.meta?.total ?? opname.items_count ?? displayedItems.length;

    // Discrepancy stats calculation
    const stats = displayedItems.reduce(
        (acc: { positive: number; negative: number; match: number }, item: OpnameItem) => {
            const diff = (Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0);
            if (diff > 0) acc.positive++;
            else if (diff < 0) acc.negative++;
            else acc.match++;
            return acc;
        },
        { positive: 0, negative: 0, match: 0 }
    );

    return (
        <div className="space-y-3.5 pb-28 sm:pb-8">
            {/* Header / Actions */}
            <OpnameItemsHeader
                opname={opname}
                itemsCount={totalItemsCount}
                isPendingSave={updateOpnameItems.isPending}
                isPendingFinalize={finalizeOpname.isPending}
                isInstructionsOpen={isInstructionsOpen}
                onToggleInstructions={() => setIsInstructionsOpen(!isInstructionsOpen)}
                onOpenEditHeader={() => setIsEditHeaderOpen(true)}
                onOpenImportExcel={() => setIsImportDraftOpen(true)}
                onSaveDraft={() => handleSaveDraft(true)}
                onOpenFinalize={() => setIsConfirmFinalizeOpen(true)}
                onBack={() => router.push(ROUTES.ADMIN_STOCK)}
            />

            {/* Collapsible Informative Instructions Guide */}
            <OpnameInstructions
                open={isInstructionsOpen}
                onClose={() => setIsInstructionsOpen(false)}
            />

            {/* Metrics Statistics */}
            <OpnameStatsCards
                totalCount={totalItemsCount}
                matchCount={stats.match}
                positiveCount={stats.positive}
                negativeCount={stats.negative}
            />

            {/* Barcode / Product Search Scanner */}
            <OpnameScannerCard
                ref={barcodeInputRef}
                disabled={updateOpnameItems.isPending}
                onProductFound={handleProductFound}
            />

            {/* Items List Container */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">Daftar Perhitungan Fisik</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
                            {totalItemsCount} Item
                        </span>
                    </div>
                    {Object.keys(pendingEdits).length > 0 && (
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={handleReset}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer hover:underline h-auto p-0"
                        >
                            Batalkan Perubahan
                        </AppButton>
                    )}
                </div>

                {/* Responsive Table / Card View with Server-Side Pagination */}
                <OpnameItemsTable
                    items={displayedItems}
                    isLoading={itemsLoading}
                    isFetching={itemsFetching}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(pp) => {
                        setPerPage(pp);
                        setPage(1);
                    }}
                    meta={itemsData?.meta}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortChange={(by, order) => {
                        setSortBy(by);
                        setSortOrder(order);
                        setPage(1);
                    }}
                    categoryOptions={categoryOptions}
                    brandOptions={brandOptions}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    onFocusBarcode={handleFocusBarcode}
                />
            </div>

            {/* Mobile Fixed Bottom Action Bar */}
            <OpnameItemsMobileBar
                itemsCount={totalItemsCount}
                stats={stats}
                isPendingSave={updateOpnameItems.isPending}
                isPendingFinalize={finalizeOpname.isPending}
                onSaveDraft={() => handleSaveDraft(true)}
                onOpenFinalize={() => setIsConfirmFinalizeOpen(true)}
            />

            {/* Floating Scroll-to-Top Button */}
            {showScrollTop && (
                <Button
                    type="button"
                    onClick={scrollToInput}
                    className="fixed bottom-14 sm:bottom-6 right-4 sm:right-6 z-50 h-10 px-3.5 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-1.5 border-none cursor-pointer font-bold text-xs"
                    title="Kembali ke Barcode Scanner"
                >
                    <IconBarcode size={16} />
                    <span>Scan</span>
                    <IconArrowUp size={13} />
                </Button>
            )}

            {/* Edit Header / Notes Dialog */}
            <EditHeaderDialog
                open={isEditHeaderOpen}
                onOpenChange={setIsEditHeaderOpen}
                opnameId={opnameId}
                initialCatatan={opname.catatan || ""}
            />

            {/* Confirm Finalize Dialog */}
            <ConfirmDialog
                open={isConfirmFinalizeOpen}
                onOpenChange={setIsConfirmFinalizeOpen}
                title="Finalisasi Stock Opname"
                description="Apakah Anda yakin ingin menyelesaikan perhitungan ini? Stok produk di inventori akan disesuaikan secara permanen dengan stok fisik lapangan."
                confirmText="Ya, Selesaikan & Update Stok"
                cancelText="Batal"
                variant="warning"
                onConfirm={handleFinalize}
                isLoading={updateOpnameItems.isPending || finalizeOpname.isPending}
            />

            {/* Confirm Reset / Kosongkan Daftar Dialog */}
            <ConfirmDialog
                open={isConfirmResetOpen}
                onOpenChange={setIsConfirmResetOpen}
                title="Batalkan Perubahan Lokal"
                description="Apakah Anda yakin ingin membatalkan semua perubahan yang belum disimpan ke server?"
                confirmText="Ya, Batalkan"
                cancelText="Tutup"
                variant="danger"
                onConfirm={handleConfirmReset}
            />

            <ImportOpnameDraftDialog
                open={isImportDraftOpen}
                onOpenChange={setIsImportDraftOpen}
                opnameUid={opnameId}
                nomorOpname={opname.nomor_opname}
                onImportSuccess={handleImportDraftSuccess}
            />
        </div>
    );
}
