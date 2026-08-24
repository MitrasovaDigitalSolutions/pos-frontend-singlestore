"use client";

import type { Member } from "@/features/members/types";
import type { Product } from "@/features/products/types";
import { useNetworkStatus } from "@/hooks/use-network-status";
import type { PaginationParams } from "@/types/api";
import { db } from "@/lib/db";
import { apiGetData, apiGetList, apiPatch, apiPost } from "@/shared/api/api-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useCheckoutStore } from "@/stores/checkout-store";
import type { ApiResponse } from "@/types/api";
import type { MemberPayment } from "@/features/members/api/members-api";
import { toast } from "sonner";
import { toUTC7String } from "@/lib/date-utils";

// Catalog auto-sync interval: every 30 minutes when online
const CATALOG_SYNC_INTERVAL_MS = 30 * 60 * 1000;

export function useSyncEngine() {
    const isOnline = useNetworkStatus();
    const queryClient = useQueryClient();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCatalogSyncing, setIsCatalogSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    const isSyncingRef = useRef(false);
    const isCatalogSyncingRef = useRef(false);

    // Update the pending transactions count from IndexedDB
    const updatePendingCount = useCallback(async () => {
        try {
            const txCount = await db.offlineTransactions
                .where("status")
                .equals("pending")
                .count();
            const debtCount = await db.offlineDebtPayments
                .where("status")
                .equals("pending")
                .count();
            setPendingCount(txCount + debtCount);
        } catch (err) {
            console.error("Gagal membaca jumlah antrean offline:", err);
        }
    }, []);

    // ─── Sync a Single Offline Transaction to /v1/transactions ──────────────────
    // Sends each transaction individually with uid, created_at, updated_at fields.
    // Does NOT auto-trigger — must be called manually from the monitoring page.
    const syncSingleTransaction = useCallback(async (uid: string): Promise<"success" | "failed"> => {
        if (!isOnline) return "failed";

        try {
            const record = await db.offlineTransactions.get(uid);
            if (!record) return "failed";

            const now = toUTC7String();
            const syncPayload = {
                ...record.payload,
                uid: record.uid,
                created_at: record.timestamp,
                updated_at: now,
            };

            await apiPost("/v1/transactions", syncPayload);

            // Mark as synced in offlineTransactions
            await db.offlineTransactions.update(uid, {
                status: "synced",
                syncedAt: now,
                errorMessage: undefined,
            });

            // Remove from offlineQueue (if still present)
            await db.offlineQueue.where("uid").equals(uid).delete();

            setLastSyncedAt(new Date());
            await updatePendingCount();
            return "success";
        } catch (err) {
            const error = err as Error;
            const errorMsg = error.message || "Gagal menghubungi server";

            await db.offlineTransactions.update(uid, {
                status: "failed",
                errorMessage: errorMsg,
            });

            await updatePendingCount();
            return "failed";
        }
    }, [isOnline, updatePendingCount]);

    // ─── Sync a Single Offline Debt Payment to /v1/members/pay-debt/{member_uid} ─
    const syncSingleDebtPayment = useCallback(async (uid: string): Promise<"success" | "failed"> => {
        if (!isOnline) return "failed";

        try {
            const record = await db.offlineDebtPayments.get(uid);
            if (!record) return "failed";

            const now = new Date().toISOString();
            const dateOnly = String(record.payload.tanggal_bayar || record.timestamp).split("T")[0];
            const syncPayload = {
                ...record.payload,
                uid: record.uid,
                tanggal_bayar: dateOnly,
            };

            const res = await apiPatch<ApiResponse<{ member: Member; payment: MemberPayment }>>(
                `/v1/members/pay-debt/${record.member_uid}`,
                syncPayload
            );

            if (res.data?.member) {
                const updatedMember = res.data.member;
                await db.members.put(updatedMember);

                const currentSelected = useCheckoutStore.getState().selectedMember;
                if (currentSelected?.uid === updatedMember.uid) {
                    useCheckoutStore.getState().setSelectedMember(updatedMember);
                }
            }

            queryClient.invalidateQueries({ queryKey: queryKeys.members.all });

            // Mark as synced
            await db.offlineDebtPayments.update(uid, {
                status: "synced",
                syncedAt: now,
                errorMessage: undefined,
            });

            setLastSyncedAt(new Date());
            await updatePendingCount();
            return "success";
        } catch (err) {
            const error = err as Error;
            const errorMsg = error.message || "Gagal menghubungi server";

            await db.offlineDebtPayments.update(uid, {
                status: "failed",
                errorMessage: errorMsg,
            });

            await updatePendingCount();
            return "failed";
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, updatePendingCount]);

    // ─── Sync Cash In/Out Offline Actions ──────────────────────────────────────────
    const syncOfflineDrawerActions = useCallback(async () => {
        if (!isOnline) return;

        try {
            const pendingActions = await db.offlineDrawerActions
                .where("status")
                .equals("pending")
                .sortBy("timestamp");

            if (pendingActions.length === 0) return;

            for (const action of pendingActions) {
                try {
                    await db.offlineDrawerActions.update(action.id!, { status: "syncing" });
                    const url = `/v1/cash-drawer/sessions/${action.session_uid}/${action.type === "cash_in" ? "cash-in" : "cash-out"}`;
                    await apiPost(url, action.payload);

                    // Successfully synced, delete it from local table
                    await db.offlineDrawerActions.delete(action.id!);
                } catch (err) {
                    const error = err as Error;
                    console.error(`Gagal sinkronisasi aksi laci kasir offline ID ${action.id}:`, error);
                    await db.offlineDrawerActions.update(action.id!, {
                        status: "failed",
                        errorMessage: error.message || "Gagal menghubungi server",
                    });
                }
            }
        } catch (err) {
            console.error("Gagal menjalankan sinkronisasi aksi laci kasir offline:", err);
        }
    }, [isOnline]);

    // ─── Sync ALL Pending Offline Debt Payments ─────────────────────────────────
    const syncOfflineDebtPayments = useCallback(async () => {
        if (!isOnline) return;

        try {
            const pendingPayments = await db.offlineDebtPayments
                .where("status")
                .equals("pending")
                .sortBy("timestamp");

            if (pendingPayments.length === 0) return;

            let successCount = 0;
            let failCount = 0;

            for (const payment of pendingPayments) {
                const result = await syncSingleDebtPayment(payment.uid);
                if (result === "success") successCount++;
                else failCount++;
            }

            if (successCount > 0) {
                toast.success(`${successCount} pembayaran hutang offline berhasil disinkronisasi.`);
            }
            if (failCount > 0) {
                toast.error(`${failCount} pembayaran hutang gagal disinkronisasi.`);
            }
        } catch (err) {
            console.error("Gagal menjalankan sinkronisasi pembayaran hutang offline:", err);
        }
    }, [isOnline, syncSingleDebtPayment]);

    // ─── Sync ALL Pending Transactions (manual trigger) ──────────────────────────
    const syncOfflineTransactions = useCallback(async () => {
        if (!isOnline || isSyncingRef.current) return;

        try {
            isSyncingRef.current = true;
            setIsSyncing(true);
            setSyncError(null);

            // Sync drawer actions first
            await syncOfflineDrawerActions();

            const pendingRecords = await db.offlineTransactions
                .where("status")
                .equals("pending")
                .sortBy("timestamp");

            if (pendingRecords.length === 0) {
                isSyncingRef.current = false;
                setIsSyncing(false);
                return;
            }

            let successCount = 0;
            let failCount = 0;

            for (const record of pendingRecords) {
                const result = await syncSingleTransaction(record.uid);
                if (result === "success") successCount++;
                else failCount++;
            }

            if (successCount > 0) {
                toast.success(`${successCount} transaksi offline berhasil disinkronisasi.`);
            }
            if (failCount > 0) {
                const msg = `${failCount} transaksi gagal disinkronisasi.`;
                setSyncError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const error = err as Error;
            console.error("Gagal menjalankan sync engine:", error);
            setSyncError(error.message || "Unknown error");
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            await updatePendingCount();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, syncSingleTransaction, updatePendingCount]);

    // ─── Sync SELECTED Pending Transactions (manual checkbox trigger) ─────────────
    const syncSelectedTransactions = useCallback(async (uids: string[]) => {
        if (!isOnline || isSyncingRef.current || uids.length === 0) return;

        try {
            isSyncingRef.current = true;
            setIsSyncing(true);
            setSyncError(null);

            let successCount = 0;
            let failCount = 0;

            for (const uid of uids) {
                const result = await syncSingleTransaction(uid);
                if (result === "success") successCount++;
                else failCount++;
            }

            if (successCount > 0) {
                toast.success(`${successCount} transaksi offline berhasil disinkronisasi.`);
            }
            if (failCount > 0) {
                const msg = `${failCount} transaksi gagal disinkronisasi.`;
                setSyncError(msg);
                toast.error(msg);
            }
        } catch (err) {
            const error = err as Error;
            console.error("Gagal menjalankan sync terpilih:", error);
            setSyncError(error.message || "Unknown error");
        } finally {
            isSyncingRef.current = false;
            setIsSyncing(false);
            await updatePendingCount();
        }
    }, [isOnline, syncSingleTransaction, updatePendingCount]);


    // ─── Atomic Catalog Syncing (Replace Strategy) ──────────────────────────────
    const syncCatalog = useCallback(async () => {
        if (!isOnline || isCatalogSyncingRef.current) return;

        try {
            isCatalogSyncingRef.current = true;
            setIsCatalogSyncing(true);

            // 1. Sync Products (Full Replace with Active Products)
            let currentPage = 1;
            let lastPage = 1;
            const perPage = 250;
            const fetchedActiveProducts: Product[] = [];

            while (currentPage <= lastPage) {
                const params: PaginationParams & { status?: string } = {
                    page: currentPage,
                    per_page: perPage,
                    status: "active",
                };

                const res = await apiGetList<Product>("/v1/products", params);
                if (res.data && res.data.length > 0) {
                    const activeOnly = res.data.filter((p) => p.status === "active");
                    fetchedActiveProducts.push(...activeOnly);
                }

                lastPage = res.meta?.last_page || 1;
                currentPage++;
            }

            // Atomic replace in IndexedDB (clears deleted & inactive items)
            await db.transaction("rw", db.products, async () => {
                await db.products.clear();
                if (fetchedActiveProducts.length > 0) {
                    await db.products.bulkPut(fetchedActiveProducts);
                }
            });

            // 2. Sync Members (Fetch all)
            try {
                const members = await apiGetData<Member[]>("/v1/members/all");
                if (members && members.length > 0) {
                    // Find pending offline debt payments to preserve un-synced debt reductions
                    const pendingDebts = await db.offlineDebtPayments
                        .where("status")
                        .equals("pending")
                        .toArray();

                    const pendingDeductions: Record<string, number> = {};
                    for (const p of pendingDebts) {
                        pendingDeductions[p.member_uid] = (pendingDeductions[p.member_uid] || 0) + (p.amount || 0);
                    }

                    const adjustedMembers = members.map((m) => {
                        const deduction = pendingDeductions[m.uid] || 0;
                        if (deduction > 0) {
                            return {
                                ...m,
                                hutang: Math.max(0, (m.hutang || 0) - deduction),
                            };
                        }
                        return m;
                    });

                    await db.members.clear();
                    await db.members.bulkPut(adjustedMembers);

                    const currentSelected = useCheckoutStore.getState().selectedMember;
                    if (currentSelected) {
                        const match = adjustedMembers.find((m) => m.uid === currentSelected.uid);
                        if (match) {
                            useCheckoutStore.getState().setSelectedMember(match);
                        }
                    }
                }
            } catch (err) {
                console.warn("Gagal sinkronisasi data member:", err);
            }

            localStorage.setItem("catalog_last_synced_at", new Date().toISOString());
            if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("pos_catalog_synced"));
            }
        } catch (err) {
            console.error("Gagal sinkronisasi katalog:", err);
        } finally {
            isCatalogSyncingRef.current = false;
            setIsCatalogSyncing(false);
        }
    }, [isOnline]);

    // Initialize pending count on mount and listen to global pending count updates
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        updatePendingCount();

        const handlePendingCountUpdated = () => {
            updatePendingCount();
        };

        if (typeof window !== "undefined") {
            window.addEventListener("pos_pending_count_updated", handlePendingCountUpdated);
            window.addEventListener("pos_member_updated", handlePendingCountUpdated);
            window.addEventListener("pos_catalog_synced", handlePendingCountUpdated);
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("pos_pending_count_updated", handlePendingCountUpdated);
                window.removeEventListener("pos_member_updated", handlePendingCountUpdated);
                window.removeEventListener("pos_catalog_synced", handlePendingCountUpdated);
            }
        };
    }, [updatePendingCount]);

    // Sync catalog when coming back online (one-time trigger)
    useEffect(() => {
        if (isOnline) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            syncCatalog();
            syncOfflineDrawerActions();
        }
        // NOTE: syncOfflineTransactions and syncOfflineDebtPayments are intentionally NOT called here.
        // Offline items must be synced manually from the monitoring dialog.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOnline, syncOfflineDrawerActions]);

    // Periodic catalog sync every 30 minutes while online
    useEffect(() => {
        if (!isOnline) return;

        const interval = setInterval(() => {
            syncCatalog();
        }, CATALOG_SYNC_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [isOnline, syncCatalog]);

    return {
        isSyncing,
        isCatalogSyncing,
        pendingCount,
        lastSyncedAt,
        syncError,
        isOnline,
        triggerSync: syncOfflineTransactions,
        triggerSingleSync: syncSingleTransaction,
        triggerSelectedSync: syncSelectedTransactions,
        triggerCatalogSync: syncCatalog,
        triggerSingleDebtPaymentSync: syncSingleDebtPayment,
        triggerDebtPaymentSync: syncOfflineDebtPayments,
        updatePendingCount,
    };
}
