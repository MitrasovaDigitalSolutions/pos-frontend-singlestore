import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useUpdateCoaCounterpartMapping } from "../../../api/counterpart-mapping-api";
import type { ChartOfAccount, CoaCounterpartMapping } from "../../../types";

interface UseCounterpartRowEditParams {
    mapping: CoaCounterpartMapping;
    accounts: ChartOfAccount[];
    existingMappings: CoaCounterpartMapping[];
}

export function useCounterpartRowEdit({
    mapping,
    existingMappings,
}: UseCounterpartRowEditParams) {
    const [isEditing, setIsEditing] = useState(false);
    const [editCoaUid, setEditCoaUid] = useState(mapping.coa_uid);
    const [editCounterpartUid, setEditCounterpartUid] = useState(mapping.counterpart_coa_uid);
    const [editKeterangan, setEditKeterangan] = useState(mapping.keterangan || "");

    const updateMutation = useUpdateCoaCounterpartMapping();

    const isDuplicate = useMemo(() => {
        if (!editCoaUid || !editCounterpartUid) return false;
        return existingMappings.some(
            (m) =>
                m.uid !== mapping.uid &&
                m.coa_uid === editCoaUid &&
                m.counterpart_coa_uid === editCounterpartUid
        );
    }, [editCoaUid, editCounterpartUid, existingMappings, mapping.uid]);

    const handleStartEdit = () => {
        setEditCoaUid(mapping.coa_uid);
        setEditCounterpartUid(mapping.counterpart_coa_uid);
        setEditKeterangan(mapping.keterangan || "");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!editCoaUid || !editCounterpartUid || isDuplicate) return;

        try {
            await updateMutation.mutateAsync({
                uid: mapping.uid,
                data: {
                    coa_uid: editCoaUid,
                    counterpart_coa_uid: editCounterpartUid,
                    keterangan: editKeterangan.trim() || null,
                },
            });
            toast.success("Mapping berhasil diperbarui.");
            setIsEditing(false);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error.message || "Gagal memperbarui mapping.");
        }
    };

    return {
        isEditing,
        setIsEditing,
        editCoaUid,
        setEditCoaUid,
        editCounterpartUid,
        setEditCounterpartUid,
        editKeterangan,
        setEditKeterangan,
        isDuplicate,
        handleStartEdit,
        handleCancelEdit,
        handleSave,
        isPending: updateMutation.isPending,
    };
}
