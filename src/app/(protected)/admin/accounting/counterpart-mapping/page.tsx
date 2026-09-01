import { CounterpartMappingPage } from "@/features/accounting/components/counterpart-mapping/counterpart-mapping-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mapping Lawan Akun | POS Accounting",
    description: "Kelola pemetaan pasangan akun penyeimbang (counterpart) CoA untuk jurnal manual dan neraca.",
};

export default function Page() {
    return <CounterpartMappingPage />;
}
