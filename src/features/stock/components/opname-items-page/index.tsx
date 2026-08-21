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
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    useFinalizeOpname,
    useOpnameDetail,
    useOpnameItems,
    useUpdateOpnameItems,
} from "../../api/stock-api";
import type { Opname, OpnameItem } from "../../types";
import { EditHeaderDialog } from "./edit-header-dialog";
import { OpnameInstructions } from "./opname-instructions";
import { OpnameItemsHeader } from "./opname-items-header";
import { OpnameItemsMobileList } from "./opname-items-mobile-list";
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
    const store = getOpnameItemsStore(opnameId);
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);
    const clearAll = store((state) => state.clearAll);

    const updateOpnameItems = useUpdateOpnameItems();
    const finalizeOpname = useFinalizeOpname();

    const { data: itemsData, isLoading: itemsLoading } = useOpnameItems(
        opnameId,
        opname.status === OPNAME_STATUS.DRAFT ? { per_page: 1000 } : undefined
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const dbItems = itemsData?.data || [];


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

    const isFirstLoad = useRef(true);
    const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
    const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
    const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
    // Default petunjuk di-HIDE (sesuai permintaan user)
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
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

    // Load initial items from database draft on mount
    useEffect(() => {
        if (!isFirstLoad.current || itemsLoading) return;

        if (store.getState().items.length > 0) {
            isFirstLoad.current = false;
            return;
        }

        if (dbItems && dbItems.length > 0) {
            const initialItems: OpnameItemLocal[] = dbItems.map((item: OpnameItem) => ({
                temp_uid: `${Date.now()}-${item.uid}-${Math.random().toString(36).substring(2, 5)}`,
                product_uid: String(item.product_uid),
                brand_uid: item.brand_uid || item.product?.brand_uid || item.brand?.uid || null,
                category_uid: item.category_uid || item.product?.category_uid || item.category?.uid || null,
                barcode: item.product?.barcode || null,
                nama: item.product?.nama || "Produk Tanpa Nama",
                stok_sistem: item.stok_sistem,
                stok_fisik: item.stok_fisik,
                alasan: item.alasan || "Opname rutin",
            }));
            store.setState({ items: initialItems });
            isFirstLoad.current = false;
        } else {
            isFirstLoad.current = false;
        }
    }, [dbItems, itemsLoading, store]);

    if (itemsLoading) {
        return <OpnameItemsSkeleton />;
    }

    const handleProductFound = (product: Product) => {
        const existing = items.find((i) => i.product_uid === product.uid);
        if (existing) {
            const newCount = (Number(existing.stok_fisik) || 0) + 1;
            addItem({
                product_uid: product.uid,
                brand_uid: product.brand_uid || product.brand?.uid || null,
                category_uid: product.category_uid || product.category?.uid || null,
                barcode: product.barcode,
                nama: product.nama,
                stok_sistem: product.stok,
                stok_fisik: newCount,
                alasan: existing.alasan || "Opname rutin",
            });
            toast.success(`Jumlah ${product.nama} (+1): sekarang ${newCount} pcs`);
        } else {
            addItem({
                product_uid: product.uid,
                brand_uid: product.brand_uid || product.brand?.uid || null,
                category_uid: product.category_uid || product.category?.uid || null,
                barcode: product.barcode,
                nama: product.nama,
                stok_sistem: product.stok,
                stok_fisik: 1, // Default 1 saat berhasil di-scan
                alasan: "Opname rutin",
            });
            toast.success(`Ditambahkan: ${product.nama} (1 pcs)`);
        }

        // Scroll and highlight the added product
        setTimeout(() => {
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
            const element = document.getElementById(`opname-item-${product.uid}`);
            if (element) {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: isMobile ? "center" : "nearest",
                });
                element.classList.add("bg-emerald-50", "ring-2", "ring-emerald-400/50");
                setTimeout(() => {
                    element.classList.remove("bg-emerald-50", "ring-2", "ring-emerald-400/50");
                }, 1400);
            }
        }, 120);
    };

    const handleSaveDraft = async (showToast = true) => {
        if (items.length === 0) {
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
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum finalisasi.");
            return;
        }

        // First, save current items to ensure database is in sync
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

    // Discrepancy stats calculation
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
                itemsCount={items.length}
                isPendingSave={updateOpnameItems.isPending}
                isPendingFinalize={finalizeOpname.isPending}
                isInstructionsOpen={isInstructionsOpen}
                onToggleInstructions={() => setIsInstructionsOpen(!isInstructionsOpen)}
                onOpenEditHeader={() => setIsEditHeaderOpen(true)}
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
                totalCount={items.length}
                matchCount={stats.match}
                positiveCount={stats.positive}
                negativeCount={stats.negative}
            />

            {/* Barcode / Product Search Scanner */}
            <OpnameScannerCard
                disabled={updateOpnameItems.isPending}
                onProductFound={handleProductFound}
            />

            {/* Items List Container */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-xs overflow-hidden">
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">Daftar Perhitungan Fisik</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
                            {items.length} Item
                        </span>
                    </div>
                    {items.length > 0 && (
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

                {/* Desktop View */}
                <OpnameItemsTable
                    items={items}
                    categoryOptions={categoryOptions}
                    brandOptions={brandOptions}
                    updateItem={updateItem}
                    removeItem={removeItem}
                />

                {/* Mobile View */}
                <OpnameItemsMobileList
                    items={items}
                    categoryOptions={categoryOptions}
                    brandOptions={brandOptions}
                    updateItem={updateItem}
                    removeItem={removeItem}
                    stats={stats}
                    isPendingSave={updateOpnameItems.isPending}
                    isPendingFinalize={finalizeOpname.isPending}
                    onSaveDraft={() => handleSaveDraft(true)}
                    onOpenFinalize={() => setIsConfirmFinalizeOpen(true)}
                />
            </div>

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
        </div>
    );
}
