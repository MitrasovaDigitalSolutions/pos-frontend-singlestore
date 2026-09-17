"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
    sellAssetSchema,
    type SellAssetSchemaInput,
} from "../schemas/asset-sell-schema";
import { useSellAsset } from "../api/assets-api";
import { useCashAccounts, type CashAccount } from "@/features/cash/api/cash-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Asset, SellAssetPayload } from "../types";

interface UseAssetSellFormProps {
    asset: Asset | null;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function useAssetSellForm({
    asset,
    onOpenChange,
    onSuccess,
}: UseAssetSellFormProps) {
    const sellAssetMutation = useSellAsset();

    const { data: cashAccounts = [], isLoading: isLoadingCash } = useCashAccounts();
    const { data: flatAccounts = [], isLoading: isLoadingCoa } = useFlatChartOfAccounts({
        is_postable: true,
    });

    // 1. Filter valid cash accounts (exclude register / kasir)
    const validCashAccounts = useMemo(() => {
        return cashAccounts.filter((acc: CashAccount) => acc.tipe !== "register");
    }, [cashAccounts]);

    const cashOptions = useMemo(() => {
        return validCashAccounts.map((acc: CashAccount) => ({
            value: acc.uid,
            label: `${acc.nama} (Saldo: ${formatRupiah(Number(acc.saldo) || 0)})`,
        }));
    }, [validCashAccounts]);

    // 2. Setup react-hook-form
    const form = useForm<SellAssetSchemaInput>({
        resolver: zodResolver(sellAssetSchema),
        mode: "onChange",
        defaultValues: {
            tanggal_jual: new Date().toISOString().split("T")[0],
            nominal_jual: undefined as unknown as number,
            cash_account_uid: validCashAccounts.length > 0 ? validCashAccounts[0].uid : "",
            offset_coa_uid: null,
            catatan: null,
        },
    });

    // 3. Watched form values
    const rawNominalJual = useWatch({
        control: form.control,
        name: "nominal_jual",
    });

    const hasEnteredNominal =
        rawNominalJual !== null &&
        rawNominalJual !== undefined &&
        rawNominalJual !== ("" as unknown) &&
        !isNaN(Number(rawNominalJual));

    const watchedNominalJual = hasEnteredNominal ? Number(rawNominalJual) : 0;

    const watchedCashUid = useWatch({
        control: form.control,
        name: "cash_account_uid",
    });

    const watchedOffsetCoaUid = useWatch({
        control: form.control,
        name: "offset_coa_uid",
    });

    // 4. Financial calculations
    const nilaiBukuSaatIni = asset ? Number(asset.nilai_buku) || 0 : 0;
    const hargaPerolehanAwal = asset ? Number(asset.harga_perolehan) || 0 : 0;
    const totalPenyusutanSaatIni = asset ? Number(asset.total_penyusutan) || 0 : 0;
    const selisih = hasEnteredNominal ? watchedNominalJual - nilaiBukuSaatIni : 0;

    const isGain = hasEnteredNominal && selisih > 0;
    const isLoss = hasEnteredNominal && selisih < 0;
    const isBreakeven = hasEnteredNominal && selisih === 0;

    // 5. Dynamic CoA Options filtered by Gain (Revenue/Equity) or Loss (Expense)
    const offsetCoaOptions = useMemo(() => {
        if (isGain) {
            return flatAccounts
                .filter((coa) => coa.tipe === "revenue" || coa.tipe === "equity")
                .map((coa) => ({
                    value: coa.uid,
                    label: `[${coa.kode}] ${coa.nama} (${coa.tipe === "revenue" ? "Pendapatan" : "Ekuitas/Modal"})`,
                }));
        }
        if (isLoss) {
            return flatAccounts
                .filter((coa) => coa.tipe === "expense")
                .map((coa) => ({
                    value: coa.uid,
                    label: `[${coa.kode}] ${coa.nama} (Beban/Biaya)`,
                }));
        }
        return [];
    }, [flatAccounts, isGain, isLoss]);

    // 6. Selected Objects for UI Slip & Previews
    const selectedCashAccount = useMemo(() => {
        if (!watchedCashUid) return null;
        return validCashAccounts.find((a: CashAccount) => a.uid === watchedCashUid) || null;
    }, [watchedCashUid, validCashAccounts]);

    const selectedOffsetCoa = useMemo(() => {
        if (!watchedOffsetCoaUid || isBreakeven) return null;
        return flatAccounts.find((a) => a.uid === watchedOffsetCoaUid) || null;
    }, [watchedOffsetCoaUid, flatAccounts, isBreakeven]);

    const assetCoa = useMemo(() => {
        if (!asset?.category) return null;
        return asset.category.coa_asset || asset.category.coaAsset || null;
    }, [asset]);

    const akumulasiCoa = useMemo(() => {
        if (!asset?.category) return null;
        return (
            asset.category.coa_akumulasi_penyusutan ||
            asset.category.coaAkumulasiPenyusutan ||
            null
        );
    }, [asset]);

    // 7. Form submit handler
    const handleSubmit = (values: SellAssetSchemaInput) => {
        if (!asset) return;

        if (isGain && !values.offset_coa_uid) {
            toast.error(
                "Akun penyeimbang untuk keuntungan penjualan aset wajib dipilih (tipe Pendapatan atau Ekuitas)."
            );
            return;
        }

        if (isLoss && !values.offset_coa_uid) {
            toast.error(
                "Akun penyeimbang untuk kerugian penjualan aset wajib dipilih (tipe Beban/Biaya)."
            );
            return;
        }

        const payload: SellAssetPayload = {
            tanggal_jual: values.tanggal_jual,
            nominal_jual: Number(values.nominal_jual) || 0,
            cash_account_uid: values.cash_account_uid,
            offset_coa_uid: isBreakeven ? null : values.offset_coa_uid || null,
            catatan: values.catatan || null,
        };

        sellAssetMutation.mutate(
            {
                uid: asset.uid,
                data: payload,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Penjualan aset '${asset.nama}' senilai ${formatRupiah(payload.nominal_jual)} berhasil dicatat.`
                    );
                    onOpenChange(false);
                    onSuccess?.();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memproses penjualan aset.");
                },
            }
        );
    };

    return {
        form,
        isPending: sellAssetMutation.isPending,
        isLoadingCash,
        isLoadingCoa,
        cashOptions,
        offsetCoaOptions,
        selectedCashAccount,
        selectedOffsetCoa,
        assetCoa,
        akumulasiCoa,
        nilaiBukuSaatIni,
        hargaPerolehanAwal,
        totalPenyusutanSaatIni,
        watchedNominalJual,
        hasEnteredNominal,
        selisih,
        isGain,
        isLoss,
        isBreakeven,
        handleSubmit,
    };
}
