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
import { clearOpnameItemsStore, getOpnameItemsStore, type OpnameItemLocal } from "@/stores/opname-items-store";
import { IconArrowUp, IconBarcode } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    useFinalizeOpname,
    useOpnameDetail,
    useOpnameItems,
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

/** Convert a server OpnameItem to the local store format with robust field fallbacks */
function toLocalItem(dbItem: OpnameItem, index: number): OpnameItemLocal {
    const raw = dbItem as unknown as Record<string, unknown>;
    return {
        temp_uid: `db-${dbItem.uid || Math.random().toString(36).substring(2, 9)}`,
        product_uid: String(dbItem.product_uid || raw.product_uid || ""),
        brand_uid: dbItem.brand_uid || dbItem.product?.brand_uid || dbItem.brand?.uid || null,
        category_uid: dbItem.category_uid || dbItem.product?.category_uid || dbItem.category?.uid || null,
        nama: dbItem.product?.nama || (raw.nama as string) || (raw.product_name as string) || "Produk",
        barcode: dbItem.product?.barcode || (raw.barcode as string) || "",
        stok_sistem: Number(dbItem.stok_sistem ?? raw.stok_sistem) || 0,
        stok_fisik: Number(dbItem.stok_fisik ?? raw.stok_fisik) || 0,
        alasan: dbItem.alasan || (raw.alasan as string) || "Opname rutin",
        updated_at: Date.now() - index, // preserve order from server
    };
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
    const store = getOpnameItemsStore(opnameId);
    const items = store((state) => state.items);
    const itemCount = store((state) => state.itemCount);
    const addItem = store((state) => state.addItem);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);
    const clearAll = store((state) => state.clearAll);
    const setItems = store((state) => state.setItems);
    const hasItem = store((state) => state.hasItem);
    const getItem = store((state) => state.getItem);

    const updateOpnameItems = useUpdateOpnameItems();
    const finalizeOpname = useFinalizeOpname();

    // Fetch items from server database for this opname draft
    const { data: dbItemsRes, isLoading: dbItemsLoading, refetch: refetchItems } = useOpnameItems(opnameId, {
        per_page: 50000,
    });
    const { refetch: refetchDetail } = useOpnameDetail(opnameId);

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

    const isHydratedRef = useRef(false);
    const barcodeInputRef = useRef<HTMLInputElement | null>(null);
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [isImportDraftOpen, setIsImportDraftOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    /** Last scan feedback state — shown inline in scanner card */
    const [lastScanFeedback, setLastScanFeedback] = useState<{
        type: "added" | "incremented";
        productName: string;
        qty: number;
    } | null>(null);

    // Load initial items from database draft (either opname.items from detail or dbItemsRes from items endpoint)
    useEffect(() => {
        if (isHydratedRef.current) return;

        const serverItems = (opname.items && opname.items.length > 0)
            ? opname.items
            : (dbItemsRes?.data || []);

        if (itemCount === 0 && serverItems.length > 0) {
            const formatted = serverItems.map((dbItem: OpnameItem, index: number) => toLocalItem(dbItem, index));
            setItems(formatted);
            isHydratedRef.current = true;
        } else if (serverItems.length > 0 || !dbItemsLoading) {
            isHydratedRef.current = true;
        }
    }, [dbItemsLoading, dbItemsRes, itemCount, opname.items, setItems]);

    const handleImportDraftSuccess = async (newItems?: OpnameItem[]) => {
        setIsSyncing(true);
        try {
            if (newItems && Array.isArray(newItems) && newItems.length > 0) {
                // Yield to main thread so React renders the skeleton immediately
                await new Promise((resolve) => setTimeout(resolve, 60));
                const formatted = newItems.map((dbItem: OpnameItem, index: number) => toLocalItem(dbItem, index));
                setItems(formatted);
                toast.success(`${formatted.length.toLocaleString("id-ID")} item berhasil dimuat ke draf.`);
                return;
            }

            // Fallback: Always refetch fresh items from server to ensure 100% sync
            const [detailRes, itemsRes] = await Promise.all([
                refetchDetail(),
                refetchItems(),
            ]);

            const freshItems = (detailRes.data?.items && detailRes.data.items.length > 0)
                ? detailRes.data.items
                : (itemsRes.data?.data || []);

            if (freshItems.length > 0) {
                await new Promise((resolve) => setTimeout(resolve, 60));
                const formatted = freshItems.map((dbItem: OpnameItem, index: number) => toLocalItem(dbItem, index));
                setItems(formatted);
                toast.success(`${formatted.length.toLocaleString("id-ID")} item berhasil disinkronkan ke draf.`);
            }
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal menyinkronkan data produk dari server.");
        } finally {
            setIsSyncing(false);
        }
    };

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

    const handleProductFound = (product: Product) => {
        // O(1) lookup — check if product already exists in Map
        const isExisting = hasItem(product.uid);
        const existingItem = isExisting ? getItem(product.uid) : undefined;

        if (isExisting && existingItem) {
            const newCount = (Number(existingItem.stok_fisik) || 0) + 1;
            addItem({
                product_uid: product.uid,
                brand_uid: product.brand_uid || product.brand?.uid || null,
                category_uid: product.category_uid || product.category?.uid || null,
                barcode: product.barcode,
                nama: product.nama,
                stok_sistem: product.stok,
                stok_fisik: newCount,
                alasan: existingItem.alasan || "Opname rutin",
            });
            toast.success(`Jumlah ${product.nama} (+1): sekarang ${newCount} pcs`);

            // Set inline feedback for scanner card
            setLastScanFeedback({
                type: "incremented",
                productName: product.nama,
                qty: newCount,
            });
        } else {
            addItem({
                product_uid: product.uid,
                brand_uid: product.brand_uid || product.brand?.uid || null,
                category_uid: product.category_uid || product.category?.uid || null,
                barcode: product.barcode,
                nama: product.nama,
                stok_sistem: product.stok,
                stok_fisik: 1,
                alasan: "Opname rutin",
            });
            toast.success(`Ditambahkan: ${product.nama} (1 pcs)`);

            // Set inline feedback for scanner card
            setLastScanFeedback({
                type: "added",
                productName: product.nama,
                qty: 1,
            });
        }

        // Clear feedback after 3 seconds
        setTimeout(() => setLastScanFeedback(null), 3000);

        setTimeout(() => {
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
            const element = document.getElementById(`opname-card-${product.uid}`) || document.getElementById(`opname-item-${product.uid}`);
            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: isMobile ? "center" : "nearest",
                });
                element.classList.add("ring-2", "ring-emerald-400/50");
                setTimeout(() => {
                    element.classList.remove("ring-2", "ring-emerald-400/50");
                }, 1400);
            }

            const qtyInput = document.getElementById(`opname-qty-${product.uid}`) as HTMLInputElement | null;
            if (qtyInput) {
                qtyInput.focus();
                qtyInput.select();
            }
        }, 80);
    };

    const handleSaveDraft = async (showToast = true) => {
        if (itemCount === 0) {
            if (showToast) toast.error("Daftar barang opname masih kosong.");
            return false;
        }

        const payload = {
            items: items.map((item) => ({
                product_uid: item.product_uid,
                brand_uid: item.brand_uid || null,
                category_uid: item.category_uid || null,
                stok_fisik: Number(item.stok_fisik) || 0,
                alasan: item.alasan || "Opname rutin",
            })),
        };

        try {
            await updateOpnameItems.mutateAsync({
                uid: opnameId,
                data: payload,
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
        if (itemCount === 0) {
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
            clearAll();
            clearOpnameItemsStore(opnameId);
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
        clearAll();
        toast.info("Daftar barang lokal berhasil dikosongkan.");
        setIsConfirmResetOpen(false);
    };

    const hasServerItems = (opname.items && opname.items.length > 0) || (dbItemsRes?.data && dbItemsRes.data.length > 0);
    if (dbItemsLoading && itemCount === 0 && !hasServerItems) {
        return <OpnameItemsSkeleton />;
    }

    const stats = items.reduce(
        (acc, item) => {
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
                itemsCount={itemCount}
                isPendingSave={updateOpnameItems.isPending || isSyncing}
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
                totalCount={itemCount}
                matchCount={stats.match}
                positiveCount={stats.positive}
                negativeCount={stats.negative}
                isLoading={isSyncing}
            />

            {/* Barcode / Product Search Scanner */}
            <OpnameScannerCard
                ref={barcodeInputRef}
                disabled={updateOpnameItems.isPending || isSyncing}
                onProductFound={handleProductFound}
                lastScanFeedback={lastScanFeedback}
            />

            {/* Items List Container */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">Daftar Perhitungan Fisik</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
                            {itemCount.toLocaleString("id-ID")} Item
                        </span>
                    </div>
                    {itemCount > 0 && !isSyncing && (
                        <AppButton
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={handleReset}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer hover:underline h-auto p-0"
                        >
                            Kosongkan Daftar
                        </AppButton>
                    )}
                </div>

                {/* Responsive Table / Card View with Client Pagination (10 per page, virtualized) */}
                <OpnameItemsTable
                    items={items}
                    categoryOptions={categoryOptions}
                    brandOptions={brandOptions}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    onFocusBarcode={handleFocusBarcode}
                    isSyncing={isSyncing}
                />
            </div>

            {/* Mobile Fixed Bottom Action Bar */}
            <OpnameItemsMobileBar
                itemsCount={itemCount}
                stats={stats}
                isPendingSave={updateOpnameItems.isPending || isSyncing}
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
                title="Kosongkan Daftar Barang"
                description="Apakah Anda yakin ingin mengosongkan seluruh daftar barang di draf lokal ini? Perubahan yang belum disimpan ke server akan hilang."
                confirmText="Ya, Kosongkan"
                cancelText="Batal"
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
