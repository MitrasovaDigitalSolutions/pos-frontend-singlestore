import { db } from "@/lib/db";
import { queryKeys } from "@/lib/query-keys";
import {
    apiDelete,
    apiGetList,
    apiPatch,
    apiPost
} from "@/shared/api/api-client";
import type { ApiResponse, PaginatedResponse, PaginationParams } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product } from "../types";

export function useProducts(params?: PaginationParams & {
    status?: string;
    category_uid?: string;
    brand_uid?: string;
    is_jasa?: string;
    include_archived?: boolean | number | string;
}) {
    return useQuery<PaginatedResponse<Product>>({
        queryKey: [...queryKeys.products.list(), params],
        queryFn: () => apiGetList<Product>("/v1/products", params),
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Product>, Error, FormData>({
        mutationFn: (newProduct) =>
            apiPost<ApiResponse<Product>, FormData>(
                "/v1/products",
                newProduct,
            ),
        onSuccess: async (res) => {
            if (res.data && res.data.status === "active") {
                try {
                    await db.products.put(res.data);
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("pos_catalog_synced"));
                    }
                } catch (err) {
                    console.warn("Gagal update IndexedDB saat create product:", err);
                }
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}
export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Product>,
        Error,
        { uid: string; data: FormData }
    >({
        mutationFn: ({ uid, data }) =>
            apiPost<ApiResponse<Product>, FormData>(
                `/v1/products/${uid}`,
                data,
            ),
        onSuccess: async (res, { uid }) => {
            try {
                if (res.data) {
                    if (res.data.status === "active") {
                        await db.products.put(res.data);
                    } else {
                        await db.products.delete(res.data.uid || uid);
                    }
                }
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("pos_catalog_synced"));
                }
            } catch (err) {
                console.warn("Gagal update IndexedDB saat update product:", err);
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useToggleProductStatus() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Product>,
        Error,
        { uid: string; status: "active" | "inactive" }
    >({
        mutationFn: ({ uid, status }) =>
            apiPatch<ApiResponse<Product>, { status: "active" | "inactive" }>(
                `/v1/products/${uid}/status`,
                { status },
            ),
        onSuccess: async (res, { uid, status }) => {
            try {
                if (status === "inactive") {
                    await db.products.delete(uid);
                } else if (res.data && res.data.status === "active") {
                    await db.products.put(res.data);
                }
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("pos_catalog_synced"));
                }
            } catch (err) {
                console.warn("Gagal update IndexedDB saat toggle status product:", err);
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useUnarchiveProduct() {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Product>,
        Error,
        { uid: string; barcode?: string }
    >({
        mutationFn: ({ uid, barcode }) =>
            apiPost<ApiResponse<Product>, { barcode?: string }>(
                `/v1/products/${uid}/unarchive`,
                barcode !== undefined ? { barcode } : {},
            ),
        onSuccess: async (res) => {
            if (res.data && res.data.status === "active") {
                try {
                    await db.products.put(res.data);
                    if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("pos_catalog_synced"));
                    }
                } catch (err) {
                    console.warn("Gagal update IndexedDB saat unarchive product:", err);
                }
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, Error, string>({
        mutationFn: (uid) => apiDelete<ApiResponse<void>>(`/v1/products/${uid}`),
        onSuccess: async (_, uid) => {
            try {
                await db.products.delete(uid);
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("pos_catalog_synced"));
                }
            } catch (err) {
                console.warn("Gagal menghapus produk dari IndexedDB:", err);
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        },
    });
}
