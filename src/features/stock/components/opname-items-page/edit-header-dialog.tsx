import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconClipboardCheck } from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateOpname } from "../../api/stock-api";
import { opnameHeaderSchema, type OpnameHeaderInput } from "../../schemas/opname-schema";

interface EditHeaderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    opnameId: string;
    initialCatatan: string;
}

export function EditHeaderDialog({
    open,
    onOpenChange,
    opnameId,
    initialCatatan,
}: EditHeaderDialogProps) {
    const updateOpname = useUpdateOpname();

    const methods = useForm<OpnameHeaderInput>({
        resolver: zodResolver(opnameHeaderSchema) as Resolver<OpnameHeaderInput>,
        defaultValues: {
            catatan: initialCatatan || "",
        },
    });

    const { handleSubmit, reset } = methods;

    useEffect(() => {
        if (open) {
            reset({ catatan: initialCatatan || "" });
        }
    }, [open, initialCatatan, reset]);

    const onSubmit = (data: OpnameHeaderInput) => {
        updateOpname.mutate(
            { uid: opnameId, data },
            {
                onSuccess: () => {
                    toast.success("Catatan stock opname berhasil diperbarui.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui catatan.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconClipboardCheck size={18} className="text-emerald-600" />
                    <span>Ubah Catatan Stock Opname</span>
                </>
            }
            className="max-w-md flex flex-col max-h-[90vh]"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0 pt-3">
                    <div className="flex-1 overflow-y-auto space-y-3 pb-3">
                        <FormInput<OpnameHeaderInput>
                            name="catatan"
                            label="Catatan Opname"
                            placeholder="Contoh: Opname Akhir Bulan..."
                            disabled={updateOpname.isPending}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 shrink-0 bg-white">
                        <Button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            variant="outline"
                            className="px-4 h-8 border-slate-200 text-slate-700 font-bold text-xs rounded-lg bg-white"
                            disabled={updateOpname.isPending}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            className="px-4 h-8 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-lg border-none"
                            disabled={updateOpname.isPending}
                        >
                            {updateOpname.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
